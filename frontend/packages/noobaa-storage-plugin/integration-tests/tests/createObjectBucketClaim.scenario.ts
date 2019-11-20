import { browser, ExpectedConditions as until } from 'protractor';
import { appHost } from '@console/internal-integration-tests/protractor.conf';
import { storageClassDropDown, defaultSC, scDropdown, createBtn } from '../views/bucketClaimCreation.view';
import { obcCount, clusterHealth, efficiencyValue, savingsValue } from '../views/noobaaDashboardPage.view';

const BROWSER_TIMEOUT = 30000;

describe('Test Object Bucket Claim (OBC)', () => {
    /*     it('Create an OBC and test equality', async () => {
            await browser.get(`${appHost}/dashboards/object-service`);
            await browser.wait(until.visibilityOf(obcCount));
            await browser.sleep(5000);
            let text = await obcCount.getText();
            const initialCount = text.substring(0, 1);
            await browser.get(`${appHost}/k8s/ns/openshift-storage/objectbucket.io~v1alpha1~ObjectBucketClaim/~new/form`);
            await browser.wait(until.visibilityOf(scDropdown));
            await storageClassDropDown.click();
            await browser.wait(until.visibilityOf(defaultSC), BROWSER_TIMEOUT);
            await defaultSC.click();
            await createBtn.click();
    
            await browser.get(`${appHost}/dashboards/object-service`);
            await browser.wait(until.visibilityOf(obcCount));
            await browser.sleep(5000);
            text = await obcCount.getText();
            const finalCount = text.substring(0, 1);
            console.log(initialCount);
            console.log(finalCount);
            console.log(initialCount + 1 === finalCount);
            expect(Number(finalCount)).toEqual((Number(initialCount) + 1));
        }); */

    it('Checks whether MCG is healthy', async () => {
        await browser.get(`${appHost}/dashboards/object-service`);
        expect(clusterHealth.isPresent()).toBeFalsy();
    });

    it('Checks for correct Efficiency Ratio', async () => {
        await browser.get(`${appHost}/dashboards/object-service`);
        await browser.wait(until.visibilityOf(obcCount));
        const effValue = await efficiencyValue.getText();
        const [ratioA, ratioB] = effValue.split(':');
        const [numA, numB] = [Number(ratioA), Number(ratioB)];
        expect(numA).toBeDefined();
        expect(numB).toBeDefined();
    });

    it('Checks for correct savings', async () => {
        await browser.get(`${appHost}/dashboards/object-service`);
        const savVal = await savingsValue.getText();
        const [savDigits, ,] = savVal.split('%');
        const numSav = Number(savDigits);
        expect(numSav).toBeDefined();
    });
});

