import { _decorator, Component, Label, lerp, Prefab, ProgressBar, } from "cc";
import { UIMgr } from "db://assets/core/ui/UIMgr";
import { changeScene } from "db://assets/core/ui/UIFast";
import { MusicBtn } from "db://assets/core/Component/MusicBtn/MusicBtn";
import { getPreLoadList, preload } from "db://assets/core/res/preload";
import { HomeScene } from "../Scripts/Scenes/HomeScene";

const { ccclass, property } = _decorator;

@ccclass("Start")
export class Start extends Component{

    @property(Prefab)
    uiPrefab: Prefab;

    @property(ProgressBar)
    progressBar: ProgressBar;

    @property(Label)
    progressTxt: Label = null;

    async onLoad() {
        UIMgr.ins.setup(this.uiPrefab);

        MusicBtn.open = localStorage.getItem("MusicStatus") != "false";
        MusicBtn.setMusicOpen(MusicBtn.open);
    }

    onDestroy() {
    }

    setProgress = (progress: number) => {
        this.progressBar.progress = progress;
        this.progressTxt.string = `加载中（${Math.round(progress * 100)}%）...`;
    }

    async start() {
        this.setProgress(0.05);

        const pkg = [
            {
                path: "common",
                type: "bundle",
            },
            {
                path: "MainGame",
                type: "bundle"
            },
        ];

        const list = await getPreLoadList(pkg, this.setProgress, 0.05, 0.2);
        await preload(list, this.setProgress, 0.2, 1);

        await changeScene(HomeScene);
    }

}


