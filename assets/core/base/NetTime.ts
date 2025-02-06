import { Director, director, game } from "cc";

export class NetTime {

    static _ins: NetTime;

    static get ins() {
        if (!this._ins) {
            this._ins = new NetTime();
        }
        return this._ins;
    }

    static now() {
        return Math.floor(NetTime.ins.currentTime);
    }

    private currentTime: number = Date.now();

    constructor() {
        director.on(Director.EVENT_BEFORE_UPDATE, this.update, this);
    }

     setTime(time: number) {
        this.currentTime = time;
    }

    update() {
        this.currentTime += (game.deltaTime * 1000);
    }

}

export const netTime = NetTime.ins;
