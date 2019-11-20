import { browser, ExpectedConditions as until } from 'protractor';
import { ops, installedOps, ocsOp, bsStoreLink, bsStoreName, regionDropdown, useast, switchToCreds, accessKey, secretKey, targetBucket, createBtn } from '../views/operatorPage.view';
import { appHost } from '@console/internal-integration-tests/protractor.conf';

const BS_NAME = 'my-dummy-store';
const ACC_KEY = 'access-key-dum-dummy';
const SEC_KEY = 'sec-key-dum-dummy';
const TB_NAME = 'my-dummy-bucket';

/* describe('Test Creation of BackingStore', () => {
    it('Create a backingstore based on AWS', async () => {
        debugger;
        /**
         * Go to installed operators
         */
        /*         await browser.get(appHost);
                await browser.wait(until.visibilityOf(ops));
                await ops.click();
                await browser.wait(until.visibilityOf(installedOps));
                await installedOps.click();
                await browser.wait(until.visibilityOf(ocsOp));
                await ocsOp.click(); */
        //
        /*
        await browser.get(`${appHost}/k8s/ns/openshift-storage/operators.coreos.com~v1alpha1~ClusterServiceVersion`);
        await browser.wait(until.visibilityOf(ocsOp));
        await ocsOp.click();
        await browser.wait(until.visibilityOf(bsStoreLink));
        await bsStoreLink.click();
        await browser.wait(until.visibilityOf(bsStoreName));
        await bsStoreName.sendKeys(BS_NAME);
        await regionDropdown.click();
        await useast.click();
        await switchToCreds.click();
        await accessKey.sendKeys(ACC_KEY);
        await secretKey.sendKeys(SEC_KEY);
        await targetBucket.sendKeys(TB_NAME);
        await createBtn.click();
    });

    it('Test actions for the backingstore', async () => {
        /**Edit
         * Delete
         
    });
})
 */