import { IBlit, IPixelBuffer } from "./api";
import {
    blit1,
    clampRegion,
    ensureSize,
    swapRB
} from "./utils";

/**
 * Buffer of indexed 8-bit int pixel values & user supplied ARGB
 * pallette.
 */
export class IndexedBuffer
    implements IPixelBuffer<Uint8Array, number>, IBlit<Uint8Array, number> {
    width: number;
    height: number;
    pixels: Uint8Array;
    pallette: Uint32Array;

    /**
     * @param width
     * @param height
     * @param pallette ARGB color values
     * @param pixels
     */
    constructor(
        width: number,
        height: number,
        pallette: Uint32Array,
        pixels?: Uint8Array
    ) {
        this.width = width;
        this.height = height;
        this.pallette = pallette;
        if (pixels) {
            ensureSize(pixels, width, height);
            this.pixels = pixels;
        } else {
            this.pixels = new Uint8Array(width * height);
        }
    }

    blit(
        buf: IPixelBuffer<Uint8Array, number>,
        dx = 0,
        dy = 0,
        sx = 0,
        sy = 0,
        w = this.width,
        h = this.height
    ) {
        blit1(
            this.pixels,
            buf.pixels,
            sx,
            sy,
            this.width,
            this.height,
            dx,
            dy,
            buf.width,
            buf.height,
            w,
            h
        );
    }

    blitCanvas(canvas: HTMLCanvasElement, x = 0, y = 0) {
        const ctx = canvas.getContext("2d")!;
        const idata = ctx.getImageData(x, y, this.width, this.height);
        const dest = new Uint32Array(idata.data.buffer);
        const src = this.pixels;
        const pallette = this.pallette;
        const nump = pallette.length;
        for (let i = dest.length; --i >= 0; ) {
            dest[i] = swapRB(pallette[src[i] % nump]);
        }
        ctx.putImageData(idata, x, y);
    }

    getRegion(x: number, y: number, width: number, height: number) {
        [x, y, width, height] = clampRegion(
            x,
            y,
            width,
            height,
            this.width,
            this.height
        );
        const dest = new IndexedBuffer(width, height, this.pallette);
        this.blit(dest, 0, 0, x, y, width, height);
        return dest;
    }

    getAt(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height
            ? this.pixels[(x | 0) + (y | 0) * this.width]
            : 0;
    }

    setAt(x: number, y: number, col: number) {
        x >= 0 &&
            x < this.width &&
            y >= 0 &&
            y < this.height &&
            (this.pixels[(x | 0) + (y | 0) * this.width] = col);
        return this;
    }
}