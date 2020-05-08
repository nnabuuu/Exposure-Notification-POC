import crypto from 'crypto';

export class HKDF {
    private readonly hashLength:number;
    private readonly prk: Buffer;
    constructor(private readonly hashAlgorithm, private readonly salt, private readonly ikm) {
        let hash = crypto.createHash(hashAlgorithm);
        this.hashLength = hash.digest().length;

        let hmac = crypto.createHmac(this.hashAlgorithm, this.salt);
        hmac.update(this.ikm);
        this.prk = hmac.digest();
    };

    derive(info, size: number): Buffer {
        let prev = Buffer.alloc(0);
        let buffers = [];
        let num_blocks = Math.ceil(size / this.hashLength);
        info = Buffer.from(info);

        for (let i=0; i<num_blocks; i++) {
            let hmac = crypto.createHmac(this.hashAlgorithm, this.prk);
            hmac.update(prev);
            hmac.update(info);
            hmac.update(Buffer.from([i + 1]));
            prev = hmac.digest();
            buffers.push(prev);
        }
        return Buffer.concat(buffers, size);
    }
}
