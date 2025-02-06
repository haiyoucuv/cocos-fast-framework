import { _decorator, Button, Component, Node, Sprite, SpriteFrame } from 'cc';
import { AudioMgr } from "../../base/AudioMgr";

const {ccclass, property, requireComponent} = _decorator;


@ccclass('MusicBtn')
@requireComponent(Button)
export class MusicBtn extends Component {


    static btnList: MusicBtn[] = [];

    private static _open: boolean = true;
    static set open(open: boolean) {
        this._open = open;

        for (const btn of this.btnList) {
            btn.open = open;
        }
    }

    static get open() {
        return this._open;
    }

    static setMusicOpen(open: boolean) {
        if (open) {
            localStorage.setItem("MusicStatus", "true");
            AudioMgr.ins.resume();
            AudioMgr.ins.musicVolume = 1;
            AudioMgr.ins.soundVolume = 1;
        } else {
            localStorage.setItem("MusicStatus", "false");
            AudioMgr.ins.stop();
            AudioMgr.ins.musicVolume = 0;
            AudioMgr.ins.soundVolume = 0;
        }
    }

    @property(SpriteFrame) openSf: SpriteFrame = null;
    @property(SpriteFrame) closeSf: SpriteFrame = null;

    sp: Sprite = null;

    private _open: boolean = true;
    set open(open: boolean) {
        this._open = open;
        this.sp.spriteFrame = open ? this.openSf : this.closeSf;
    }

    get open() {
        return this._open;
    }

    onLoad() {
        this.sp = this.getComponent(Sprite);
        MusicBtn.btnList.push(this);
        MusicBtn.open = MusicBtn.open;
        this.node.on(Button.EventType.CLICK, this.clickNode, this);
    }

    protected onDestroy() {
        MusicBtn.btnList.splice(MusicBtn.btnList.indexOf(this), 1);
    }

    clickNode() {
        MusicBtn.open = !MusicBtn.open;
        MusicBtn.setMusicOpen(MusicBtn.open);
    }
}

