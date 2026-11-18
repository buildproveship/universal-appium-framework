import "dotenv/config";

type SharedConfig = Omit<WebdriverIO.Config, "capabilities">;

// Capabilities that every platform config uses; platform files add their own.
export const sharedCapabilities = {
  "appium:newCommandTimeout": 120,
} satisfies WebdriverIO.Capabilities;

export const sharedConfig: SharedConfig = {
  runner: "local",
  specs: ["./features/**/*.feature"],
  maxInstances: 1,
  logLevel: "info",
  framework: "cucumber",
  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "allure-results",
      },
    ],
  ],
  services: [
    [
      "appium",
      {
        command: "appium",
      },
    ],
  ],
  waitforTimeout: 10_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 1,
  cucumberOpts: {
    require: ["./features/step-definitions/**/*.ts"],
    timeout: 60_000,
  },
};
