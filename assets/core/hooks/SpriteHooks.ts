import {assetManager, ImageAsset, Sprite, SpriteFrame, Texture2D} from "cc";
import {EDITOR} from "cc/env";

const SpCache: { [key in string]: SpriteFrame } = {}

function loadRemoteSp(url): Promise<SpriteFrame> {
    return new Promise((resolve, reject) => {

        if (!url) {
            resolve(null);
            return null;
        }

        if (SpCache[url]) {
            resolve(SpCache[url]);
            return;
        }

        assetManager.loadRemote<Texture2D>(url, (err, imageAsset: ImageAsset) => {
            if (err) {
                return;
            }
            const texture = new Texture2D();
            texture.image = imageAsset;
            const sp = new SpriteFrame();
            sp.texture = texture;

            SpCache[url] = sp;

            resolve(sp);
        });
    });

}

Sprite.prototype["_spriteFrameId"] = 0;

Object.defineProperty(Sprite.prototype, "spriteFrame", {
    // get(): any {
    //     return this._spriteFrame;
    // },
    set(value) {
        if (this._spriteFrame === value) {
            return;
        }

        const id = ++this["_spriteFrameId"];
        if (typeof value === 'string') {

            loadRemoteSp(value).then((sp: SpriteFrame) => {
                if (id !== this["_spriteFrameId"]) return;

                const lastSprite = this._spriteFrame;
                this._spriteFrame = sp;
                this.markForUpdateRenderData();
                this._applySpriteFrame(lastSprite);

                if (EDITOR) {
                    this.node.emit(Sprite.EventType.SPRITE_FRAME_CHANGED, this);
                }
            });
            // assetManager.loadRemote<Texture2D>(value, (err, imageAsset: ImageAsset) => {
            //     if (id !== this["_spriteFrameId"]) return;
            //     const texture = new Texture2D();
            //     texture.image = imageAsset;
            //     const sp = new SpriteFrame();
            //     sp.texture = texture;
            //
            //     const lastSprite = this._spriteFrame;
            //     this._spriteFrame = sp;
            //     this.markForUpdateRenderData();
            //     this._applySpriteFrame(lastSprite);
            //
            //     if (EDITOR) {
            //         this.node.emit(Sprite.EventType.SPRITE_FRAME_CHANGED, this);
            //     }
            //
            // });
        } else {
            const lastSprite = this._spriteFrame;
            this._spriteFrame = value;
            this.markForUpdateRenderData();
            this._applySpriteFrame(lastSprite);

            if (EDITOR) {
                this.node.emit(Sprite.EventType.SPRITE_FRAME_CHANGED, this);
            }
        }
    }
});