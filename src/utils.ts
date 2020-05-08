export const ALG = 'sha256';
export const TEK_ROLLING_PERIOD = 144;

export function PaddedData(Timestamp: number): Buffer {
    let ENIN = Timestamp / 60 / 10;
    let buf1 = Buffer.from('EN-RPI', 'utf-8');
    let buf2 = Buffer.alloc(6, 0);
    let buf3 = Buffer.alloc(4);
    buf3.writeUInt32LE(ENIN);
    return Buffer.concat([buf1, buf2, buf3]);
}