import { Node, AudioSource, AudioClip, assetManager } from 'cc';

interface IPlayOptions {
    bundleName?: string,
    volume?: number,
}

export class AudioMgr {

    private static _ins: AudioMgr;
    public static get ins(): AudioMgr {
        if (!this._ins) {
            this._ins = new AudioMgr();
        }
        return this._ins;
    }

    private _audioSource: AudioSource;
    private _musicVolume = 1.0;
    private _musicVolumeScale = 1.0;
    private _soundVolume = 1.0;

    constructor() {

        const audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        this._audioSource = new AudioSource();
    }

    public get audioSource() {
        return this._audioSource;
    }

    public set musicVolume(v: number) {
        this._musicVolume = v;
        this._audioSource.volume = this._musicVolume * this._musicVolumeScale;
    }

    public get musicVolume() {
        return this._musicVolume;
    }

    public set soundVolume(v: number) {
        this._soundVolume = v;
    }
    public get soundVolume() {
        return this._soundVolume;
    }

    playOneShot(sound: AudioClip | string, options: IPlayOptions = {}) {

        options = {
            bundleName: "resources",
            volume: this.soundVolume,
            ...options
        };

        if (sound instanceof AudioClip) {
            this.audioSource.playOneShot(sound, options.volume);
        } else {
            let bundle = assetManager.getBundle(options.bundleName);
            bundle.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                } else {
                    this.audioSource.playOneShot(clip, options.volume);
                }
            });
        }
    }

    play(sound: AudioClip | string, options: { loop?: boolean } & IPlayOptions = {}) {

        options = {
            bundleName: "resources",
            loop: true,
            volume: 1,
            ...options
        };

        this._musicVolumeScale = options.volume;
        if (sound instanceof AudioClip) {
            this.audioSource.clip = sound;
            this.audioSource.loop = options.loop;
            this.audioSource.play();
            this.audioSource.volume = this._musicVolume * this._musicVolumeScale;
        } else {
            let bundle = assetManager.getBundle(options.bundleName);
            bundle.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                } else {
                    this.audioSource.clip = clip;
                    this.audioSource.loop = options.loop;
                    this.audioSource.play();
                    this.audioSource.volume = this._musicVolume * this._musicVolumeScale;
                }
            });
        }
    }


    stop() {
        this._audioSource.stop();
    }

    pause() {
        this._audioSource.pause();
    }

    resume() {
        this._audioSource.play();
    }
}