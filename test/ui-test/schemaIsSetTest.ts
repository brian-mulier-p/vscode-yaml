import path = require('path');
import os = require('os');
import { WebDriver, VSBrowser, Key, InputBox, TextEditor, StatusBar, By } from 'vscode-extension-tester';

/**
 * @author Zbynek Cervinka <zcervink@redhat.com>
 */
export function schemaIsSetTest(): void {
  describe('Verify that the right JSON schema has been selected', () => {
    it('The right JSON schema has been selected', async function () {
      this.timeout(30000);

      const driver: WebDriver = VSBrowser.instance.driver;
      await driver.actions().sendKeys(Key.F1).perform();

      let input = await InputBox.create();
      await input.setText('>new file');
      await input.confirm();
      await input.confirm();

      await driver.actions().sendKeys(Key.chord(TextEditor.ctlKey, 's')).perform();
      input = await InputBox.create();
      await input.setText('~/kustomization.yaml');
      await input.confirm();

      (await VSBrowser.instance.driver.wait(() => {
        return schemaLabelExists('kustomization.yaml');
      }, 10000)) as boolean;
    });

    afterEach(async function () {
      /* eslint-disable */
      const fs = require('fs');
      const homeDir = os.homedir();
      const pathtofile = path.join(homeDir, 'kustomization.yaml');

      if (fs.existsSync(pathtofile)) {
        console.log(`yaml file does exist - removing`);
        fs.rmSync(pathtofile, { recursive: true, force: true });
      } else {
        console.log(`yaml file does NOT exist - NOT removing`);
      }
    });
  });
}

async function schemaLabelExists(text: string): Promise<boolean> {
  const statusbar = new StatusBar();
  const schemalabel = await statusbar.findElements(By.xpath('.//a[@aria-label="' + text + ', Select JSON Schema"]'));
  return schemalabel.length == 1;
}
