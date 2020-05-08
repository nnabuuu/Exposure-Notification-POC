import {HKDF} from "./hkdf";
import crypto from "crypto";
import { ALG, PaddedData } from "./utils";

const TEK_ROLLING_PERIOD = 144;

export class DayRecord {
    temporaryExposureKey: Buffer;
    rollingProximityIdentifierKey: Buffer;
    rollingProximityIdentifierRecords: Buffer[] = [];
    associatedEncryptedMetadataKey: Buffer;
    associatedEncryptedMetadatas: Buffer[] = [];
    i: number;

    constructor(private readonly timestamp, private readonly metadata) {
        this.temporaryExposureKey = crypto.randomBytes(16);
        this.i = Math.floor(timestamp / TEK_ROLLING_PERIOD) * TEK_ROLLING_PERIOD;

        let hkdf = new HKDF(ALG, Buffer.alloc(16, 0), this.temporaryExposureKey);

        // Rolling Proximity Identifier Key
        this.rollingProximityIdentifierKey = hkdf.derive(Buffer.from("EN-RPIK", 'utf-8'), 16);
        this.associatedEncryptedMetadataKey = hkdf.derive(Buffer.from("EN-AEMK", 'utf-8'), 16);

        // Generate Rolling Proximity Identifier, 1 for each 10 minutes
        for(let n = 0; n < 144; n++) {
            let subTimeStamp = this.i + n * 600;
            let subI = Math.floor(subTimeStamp / 600 ) * 600;
            const RPICipher = crypto.createCipheriv('aes-128-ecb', this.rollingProximityIdentifierKey, Buffer.alloc(0));
            RPICipher.setAutoPadding(true);
            let paddedData = PaddedData(subI);
            const rollingProximityIdentifier = RPICipher.update(paddedData)
            this.rollingProximityIdentifierRecords.push(rollingProximityIdentifier);
            const AEMCipher = crypto.createCipheriv('aes-128-ctr', this.associatedEncryptedMetadataKey, rollingProximityIdentifier);
            const associatedEncryptedMetadata = Buffer.concat([AEMCipher.update(this.metadata), AEMCipher.final()]);
            this.associatedEncryptedMetadatas.push(associatedEncryptedMetadata);
        }
    }

    get TemporaryExposureKey(): Buffer {
        return this.temporaryExposureKey;
    }

    get I(): number {
        return this.i;
    }

    get RollingProximityIdentifierRecords(): Buffer[] {
        return this.rollingProximityIdentifierRecords;
    }

    get AssociatedEncryptedMetadatas(): Buffer[] {
        return this.associatedEncryptedMetadatas;
    }
}
