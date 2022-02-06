import config from '@/config';
import SQLiteDatabase from 'esaint/backends/sqlite';
import fs from 'fs';
import models from '../models';
import regionalModelUpdates from '../models/regionalModelUpdates';
import postStart, { setCurrencySymbols } from '../server/postStart';
import { DB_CONN_FAILURE } from './messages';
import runMigrate from './migrate';
import { callInitializeMoneyMaker, getSavePath } from './utils';

export async function createNewDatabase() {
  const { canceled, filePath } = await getSavePath('books', 'db');
  if (canceled || filePath.length === 0) {
    return '';
  }

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return filePath;
}

async function runRegionalModelUpdates() {
  if (!(await esaint.db.knex.schema.hasTable('SingleValue'))) {
    return;
  }

  const { country, setupComplete } = await esaint.db.getSingle(
    'AccountingSettings'
  );
  if (!parseInt(setupComplete)) return;
  await regionalModelUpdates({ country });
}

export async function connectToLocalDatabase(filePath) {
  if (!filePath) {
    return { connectionSuccess: false, reason: DB_CONN_FAILURE.INVALID_FILE };
  }

  esaint.login('Administrator');
  try {
    esaint.db = new SQLiteDatabase({
      dbPath: filePath,
    });
    await esaint.db.connect();
  } catch (error) {
    console.error(error);
    return { connectionSuccess: false, reason: DB_CONN_FAILURE.CANT_CONNECT };
  }

  // first init no currency, for migratory needs
  await callInitializeMoneyMaker();

  try {
    await runRegionalModelUpdates();
  } catch (error) {
    console.error('regional model updates failed', error);
  }

  try {
    await runMigrate();
    await postStart();
  } catch (error) {
    if (!error.message.includes('SQLITE_CANTOPEN')) {
      throw error;
    }

    console.error(error);
    return { connectionSuccess: false, reason: DB_CONN_FAILURE.CANT_OPEN };
  }

  // set file info in config
  const { companyName } = esaint.AccountingSettings;
  let files = config.get('files') || [];
  if (
    !files.find(
      (file) => file.filePath === filePath && file.companyName === companyName
    )
  ) {
    files = [
      {
        companyName,
        filePath,
      },
      ...files.filter((file) => file.filePath !== filePath),
    ];
    config.set('files', files);
  }

  // set last selected file
  config.set('lastSelectedFilePath', filePath);

  // second init with currency, normal usage
  await callInitializeMoneyMaker();
  return { connectionSuccess: true, reason: '' };
}

export function purgeCache(purgeAll = false) {
  const filterFunction = purgeAll
    ? () => true
    : (d) => esaint.docs[d][d] instanceof esaint.BaseMeta;

  Object.keys(esaint.docs)
    .filter(filterFunction)
    .forEach((d) => {
      esaint.removeFromCache(d, d);
      delete esaint[d];
    });

  if (purgeAll) {
    delete esaint.db;
    esaint.initializeAndRegister(models, true);
  }
}

export async function postSetup() {
  await setCurrencySymbols();
}
