import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, NgZone } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { codePush, InstallMode } from 'capacitor-codepush';
import ApkUpdater, { Update } from 'cordova-plugin-apkupdater';
import { ModalService, ToastService } from 'ng-zorro-antd-mobile';
@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent {
  @Input() name: string;
  progress = 100;

  constructor(
    private platform: Platform,
    private zone: NgZone,
    private toastSrv: ToastService,
    private modalSrv: ModalService,
    private http: HttpClient
  ) {}

  check() {
    this.localFirmwareUpdate().then();
  }
  checkUpdate() {
    codePush
      .sync(
        {
          installMode: InstallMode.ON_NEXT_RESTART, // 安装模式：马上更新
          minimumBackgroundDuration: 3,
          // updateDialog: {
          //   // 是否显示更新描述
          //   appendReleaseDescription: false,
          //   // 更新描述的前缀。 默认为"Description"
          //   descriptionPrefix: '更新内容：',
          //   // 强制更新按钮文字，默认为continue
          //   mandatoryContinueButtonLabel: '立即更新',
          //   // 强制更新时的信息. 默认为"An update is available that must be installed."
          //   mandatoryUpdateMessage: '必须更新后才能使用',
          //   // 非强制更新时，按钮文字,默认为"ignore"
          //   optionalIgnoreButtonLabel: '下次再说',
          //   // 非强制更新时，确认按钮文字. 默认为"Install"
          //   optionalInstallButtonLabel: '后台更新',
          //   // 非强制更新时，检查到更新的消息文本
          //   optionalUpdateMessage: '是否马上更新？',
          //   // Alert窗口的标题
          //   updateTitle: '发现新版本',
          // },
          updateDialog: false,
          onSyncStatusChanged: async (e) => {
            switch (e) {
              case 0:
                this.toastSrv.success('app已经是最新版本');
                break;
              case 1:
                this.modalSrv.alert('更新已准备完成', '马上重启更新App？', [
                  { text: '稍后', onPress: () => console.log('cancel') },
                  {
                    text: '马上重启',
                    onPress: async () => {
                      await codePush.restartApplication();
                    },
                  },
                ]);
                break;
              case 2:
                this.toastSrv.success('已忽略该次更新');
                break;
              case 4:
                this.toastSrv.success('后台更新中...');
                break;
              case 7:
                this.toastSrv.success('更新包下载中...');
                break;
              case 8:
                this.toastSrv.success('更新包下载完成');
                break;

              default:
                break;
            }
          },
        },
        (e) => {
          this.zone.run(() => {
            this.progress = (e.receivedBytes / e.totalBytes) * 100;
          });
        }
      )
      .then((syncStatus: any) => {});
  }

  private remote = 'http://150.158.153.168:9998';
  // 远程固件更新
  async romateFirmwareUpdate() {
    try {
      console.log('开始固件更新');
      const manifest: any = await this.http
        .get(this.remote + '/update/app-release.json')
        .toPromise();
      console.log('获取固件版本信息:' + JSON.stringify(manifest));
      const remoteVersion = manifest.app.version.code;
      const installedVersion = (await ApkUpdater.getInstalledVersion()).version
        .code;
      console.log(
        `比较版本信息: 当前版本${installedVersion} , 远程版本 ${remoteVersion}`
      );
      if (remoteVersion > installedVersion) {
        await ApkUpdater.download(this.remote + '/update/app-release.zip');
        console.log(`下载完成`);
        this.modalSrv.alert('更新已准备完成', '马上更新App？', [
          { text: '稍后', onPress: () => console.log('cancel') },
          {
            text: '马上更新',
            onPress: async () => {
              await ApkUpdater.install();
              console.log(`开始安装`);
            },
          },
        ]);
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  /// 本地固件更新
  async localFirmwareUpdate() {
    try {
      console.log('开始固件更新');
      const manifest: any = await ApkUpdater.getDownloadedUpdate;
      console.log('获取固件版本信息:' + JSON.stringify(manifest));
      const remoteVersion = manifest.app.version.code;
      const installedVersion = (await ApkUpdater.getInstalledVersion()).version
        .code;
      console.log(
        `比较版本信息: 当前版本${installedVersion} , 远程版本 ${remoteVersion}`
      );
      if (remoteVersion > installedVersion) {
        await ApkUpdater.download(this.remote + '/update/app-release.zip');
        console.log(`下载完成`);
        this.modalSrv.alert('更新已准备完成', '马上更新App？', [
          { text: '稍后', onPress: () => console.log('cancel') },
          {
            text: '马上更新',
            onPress: async () => {
              await ApkUpdater.install();
              console.log(`开始安装`);
            },
          },
        ]);
      } else {
        await this.romateFirmwareUpdate();
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
}
