import esaint from 'esaint';

async function setAugmentedModel(model, regionalInfo) {
  const getAugmentedModel = (
    await import('./doctype/' + model + '/RegionalChanges')
  ).default;
  const augmentedModel = getAugmentedModel(regionalInfo);
  esaint.models[model] = augmentedModel;
  esaint.models[model].augmented = 1;
}

export default async function regionalModelUpdates(regionalInfo) {
  for (let model in esaint.models) {
    const { regional, basedOn, augmented } = esaint.models[model];
    if (!regional || basedOn || augmented) {
      continue;
    }
    await setAugmentedModel(model, regionalInfo);
  }
}
