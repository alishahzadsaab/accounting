import BaseDocument from 'esaint/model/document';

export default class Event extends BaseDocument {
  alertEvent() {
    alert(this.title);
  }
}
