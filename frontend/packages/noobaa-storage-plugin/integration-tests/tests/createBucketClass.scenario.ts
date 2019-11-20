import { browser, ExpectedConditions as until } from 'protractor';
import { ops, installedOps, ocsOp, bsStoreLink, bsStoreName, regionDropdown, useast, switchToCreds, accessKey, secretKey, targetBucket, createBtn } from '../views/operatorPage.view';
import { appHost } from '@console/internal-integration-tests/protractor.conf';
import { bcCreateLink, bcNameInput, nextBtn, spreadTier1, createBSinBC, searchTier1, option1, createBC, resourceItem } from '../views/bucketClassCreation.view';

const BC_NAME = "my-dummy-bucket";
const BS_NAMES = [
    "my-bs-1",
    "my-bs-2",
    "my-bs-3",
    "my-bs-4"
];
const ACC_KEY = "masjfasjflsajf";
const SEC_KEY = "asjflksajflk98809";
const BUCKET_NAME = "my-s3-bucket";

describe('Test creation of Bucket Class(Wizard Flow)', () => {
    it('Creates a 1 tier bucket class', async () => {
        //Spread with 1 backingsore
        //Creates a backingstore
        await browser.get(`${appHost}/k8s/ns/openshift-storage/operators.coreos.com~v1alpha1~ClusterServiceVersion`);
        await browser.wait(until.visibilityOf(ocsOp));
        await ocsOp.click();
        //Create BC
        await browser.wait(until.visibilityOf(bcCreateLink));
        await bcCreateLink.click();
        //page -1
        await browser.wait(until.visibilityOf(bcNameInput));
        await bcNameInput.sendKeys(BC_NAME);
        await nextBtn.click();
        //page -2
        await browser.wait(until.visibilityOf(spreadTier1));
        spreadTier1.click();
        await nextBtn.click();
        //page -3
        await browser.wait(until.visibilityOf(createBSinBC));
        await createBSinBC.click();
        //page -4
        await browser.wait(until.visibilityOf(bsStoreName));
        await bsStoreName.sendKeys(BS_NAMES[0]);
        await regionDropdown.click();
        await useast.click();
        await switchToCreds.click();
        await accessKey.sendKeys(ACC_KEY);
        await secretKey.sendKeys(SEC_KEY);
        await targetBucket.sendKeys(BUCKET_NAME);
        await createBtn.click();
        await searchTier1.sendKeys(BS_NAMES[0]);
        await option1.click();
        await nextBtn.click();
        await createBC.click();
        await browser.wait(until.visibilityOf(resourceItem));
        const resName = (await resourceItem.getText()).trim();
        expect(resName).toEqual(BS_NAMES[0]);
    })
})
