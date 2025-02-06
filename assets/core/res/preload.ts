import { assetManager, AssetManager, lerp, resources } from "cc";

export async function preload(
    pkg: {
        path: string;
        bundle: AssetManager.Bundle
    }[],
    onProcess = (process: number) => void 0,
    from = 0,
    to = 1,
) {
    const total = pkg.length;
    let loaded = 0;

    const ps = pkg.map((asset) => {
        return new Promise<void>((resolve) => {
            asset.bundle.load(asset.path, () => {
                loaded++;
                const progress = lerp(from, to, loaded / total);
                onProcess(progress);
                resolve();
            });
        });
    });

    await Promise.all(ps);
}

export async function getPreLoadList(
    pkg: ({ path: string, type: string } | string)[],
    onProcess = (process: number) => void 0,
    from = 0,
    to = 1,
) {
    const pathArr: {
        path: string;
        bundle: AssetManager.Bundle;
    }[] = [];

    const ps = [];

    let total = 0;
    let loaded = 0;

    pkg.forEach((asset) => {
        if (typeof asset == "string") {
            return pathArr.push({
                path: asset,
                bundle: resources,
            });
        }
        switch (asset.type) {
            case "dir":
                resources.getDirWithPath(asset.path)
                    .forEach((v) => {
                        pathArr.push({
                            path: v.path,
                            bundle: resources
                        });
                    });
                break;
            case "bundle":
                total++;
                ps.push(
                    new Promise<void>((resolve) => {
                        assetManager.loadBundle(asset.path, (err, bundle) => {
                            if (err) console.error(1231231, err);
                            bundle.getDirWithPath("").forEach((assets) => {
                                pathArr.push({
                                    path: assets.path,
                                    bundle: bundle
                                });
                            });

                            loaded++;
                            const progress = lerp(from, to, loaded / total);
                            onProcess(progress);
                            resolve();
                        });
                    })
                );
                break;

            default:
                pathArr.push({
                    bundle: resources,
                    path: asset.path
                });
        }
    });

    await Promise.all(ps);

    return pathArr;
};
