import {DayRecord} from "./day_record";
import crypto from "crypto";
import {HKDF} from "./hkdf";
import { PaddedData, ALG } from "./utils";

export class Device {

    records: DayRecord[] = [];
    contacts: [Buffer, Buffer][] = [];
    constructor(private readonly name) {};

    generateRecord(timeStamp: number) {
        this.records.push(new DayRecord(timeStamp, this.name));
    }

    get Records(): DayRecord[] {
        return this.records;
    }

    receiveBroadcastedContact(rollingProximityIdentifierRecord: Buffer, associatedEncryptedMetadata: Buffer) {
        this.contacts.push([rollingProximityIdentifierRecord, associatedEncryptedMetadata]);
    }

    detect(temporaryExposureKey: Buffer, i: number): boolean {
        const hkdf = new HKDF(ALG, Buffer.alloc(16, 0), temporaryExposureKey);

        // Rolling Proximity Identifier Key
        const rollingProximityIdentifierKey = hkdf.derive(Buffer.from("EN-RPIK", 'utf-8'), 16);

        let found: boolean = false;
        for(let n = 0; n < 144; n++) {
            let subTimeStamp = i + n * 600;
            let subI = Math.floor(subTimeStamp / 600 ) * 600;
            const RPICipher = crypto.createCipheriv('aes-128-ecb', rollingProximityIdentifierKey, null);
            let paddedData = PaddedData(subI);
            const rollingProximityIdentifier = RPICipher.update(paddedData)
            this.contacts.forEach(function (contact) {
                if(contact[0].equals(rollingProximityIdentifier)) {
                    console.log('Detect a matching record!');
                    console.log('Rolling Proximity Identifier:');
                    console.log(rollingProximityIdentifier);
                    found = true;
                    const associatedEncryptedMetadataKey = hkdf.derive(Buffer.from("EN-AEMK", 'utf-8'), 16);
                    const AEMDecipher = crypto.createDecipheriv('aes-128-ctr', associatedEncryptedMetadataKey, rollingProximityIdentifier);
                    let decipheredMetadata = Buffer.concat([AEMDecipher.update(contact[1]), AEMDecipher.final()]);
                    console.log(`Deciphered metadata content with AES-128-CTR(AEMK, RPI, AEM): ${decipheredMetadata.toString()}`);
                }
            });
        }
        return found;
    }
}