import {  assetManager, AssetManager } from "cc";

namespace RES {

    export function loadBundle(name: string): Promise<AssetManager.Bundle> {
        return new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(name, (err, loadedBundle) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(loadedBundle);
                }
            });
        });

    }


}
export default RES;
