import {Device} from "./device";

let deviceA = new Device('Device A');
let deviceB = new Device('Device B');

console.log('====== Generating 14 days records for Device A and Device B');
let startDate = new Date();
let date = startDate;
for(let i = 0; i < 14; i++) {
    const timestamp = Math.floor(date.getTime() / 1000);
    deviceA.generateRecord(timestamp);
    deviceB.generateRecord(timestamp);
    date.setDate(date.getDate() + 1);
}

console.log('====== Device A receiving Device B\'s record at Day 5 Time frame 16');
let contact = deviceB.Records[5];
console.log('Rolling Proximity Identifier:');
console.log(contact.RollingProximityIdentifierRecords[16]);
console.log('Associated Encrypted Metadata:');
console.log(contact.AssociatedEncryptedMetadatas[16]);

deviceA.receiveBroadcastedContact(contact.RollingProximityIdentifierRecords[16], contact.AssociatedEncryptedMetadatas[16]);

console.log(`====== Device A Detecting using TemporaryExposureKey and I:`);
console.log(contact.TemporaryExposureKey);
console.log(contact.I);
const detected = deviceA.detect(contact.TemporaryExposureKey, contact.I);
console.log(`Detected?: ${detected}`);

