import { OnApplicationBootstrap } from '@nestjs/common';
const init = require("./legacy/data/init")

export class BootstrapService implements OnApplicationBootstrap {

  async onApplicationBootstrap() {
    init()

    console.log('Bootstrap completed ✅');
  }
}
