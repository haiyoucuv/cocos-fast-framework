import { Component } from "cc";

export function* getItemGenerator(length: number, func: (index: number) => any) {
  for (let i = 0; i < length; i++) {
    yield func(i);
  }
}

export function executePreFrame(generator: Generator, duration: number, context: Component) {
  return new Promise<void>((resolve, reject) => {
    const gen = generator;
    // 创建执行函数
    const execute = () => {

      // 执行之前，先记录开始时间戳
      let startTime = Date.now();

      // 然后一直从 Generator 中获取已经拆分好的代码段出来执行
      for (let iter = gen.next(); ; iter = gen.next()) {

        // 判断是否已经执行完所有 Generator 的小代码段
        // 如果是的话，那么就表示任务完成
        if (iter == null || iter.done) {
          resolve();
          return;
        }

        // 每执行完一段小代码段，都检查一下是否
        // 已经超过我们分配给本帧，这些小代码端的最大可执行时间
        if (Date.now() - startTime > duration) {
          // 如果超过了，那么本帧就不在执行，开定时器，让下一帧再执行
          context.scheduleOnce(() => {
            execute();
          });
          return;
        }
      }
    };

    // 运行执行函数
    execute();
  });
}
