import {Device} from "./device";

function main() {
    let deviceA = new Device('Device A');
    let deviceB = new Device('Device B');
    let deviceC = new Device('Device C');

    console.log('====== Generating 14 days records for Device A, B and C');
    let startDate = new Date();
    let date = startDate;
    for(let i = 0; i < 14; i++) {
        const timestamp = Math.floor(date.getTime() / 1000);
        deviceA.generateRecord(timestamp);
        deviceB.generateRecord(timestamp);
        deviceC.generateRecord(timestamp);
        date.setDate(date.getDate() + 1);
    }

    console.log('====== Device A and Device B exchange data at Day 5 Time frame 16');
    exchange(deviceA, deviceB, 5, 16);

    console.log('====== Device A and Device B exchange data at Day 5 Time frame 20');
    exchange(deviceA, deviceC, 5, 20);
    
    console.log('Device B\'s TEK upload to cloud then downloaded by A and C');
    console.log(deviceB.Records[5].TemporaryExposureKey);
    console.log(deviceB.Records[5].I);

    console.log(`====== Device A Detecting Exposure using TemporaryExposureKey and I:`);
    let detectedByA = deviceA.detect(deviceB.Records[5].TemporaryExposureKey, deviceB.Records[5].I);
    console.log(`Device A detect exposure?: ${detectedByA}`);

    console.log(`====== Device C Detecting Exposure using TemporaryExposureKey and I:`);
    let detectedByC = deviceC.detect(deviceB.Records[5].TemporaryExposureKey, deviceB.Records[5].I);
    console.log(`Device C detect exposure?: ${detectedByC}`);

}

function exchange(deviceA: Device, deviceB: Device, day: number, time: number) {
    deviceA.receiveBroadcastedContact(deviceB.Records[day].RollingProximityIdentifierRecords[time], deviceB.Records[day].AssociatedEncryptedMetadatas[time]);
    deviceB.receiveBroadcastedContact(deviceA.Records[day].RollingProximityIdentifierRecords[time], deviceA.Records[day].AssociatedEncryptedMetadatas[time]);
}

main();
