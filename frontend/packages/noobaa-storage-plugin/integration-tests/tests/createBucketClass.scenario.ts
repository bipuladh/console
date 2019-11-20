import { browser, ExpectedConditions as until } from 'protractor';
import { ops, installedOps, ocsOp, bsStoreLink, bsStoreName, regionDropdown, useast, switchToCreds, accessKey, secretKey, targetBucket, createBtn, azureBlob, providerDropdown, s3Compatible, gcs, pvc, scDropdown, rbdClass } from '../views/operatorPage.view';
import { appHost, testName } from '@console/internal-integration-tests/protractor.conf';
import { bcCreateLink, bcNameInput, nextBtn, spreadTier1, createBSinBC, searchTier1, option1, createBC, resourceItem, mirrorTier1, spreadTier2, mirrorTier2, addTier, tier1Option1, tier1Option2, tier2Option1, tier2Option2, createBackingStoreModalLink } from '../views/bucketClassCreation.view';

const BC_NAME = `my-dummy-bucket-${testName}`;
const BS_NAMES = [
    `my-bs-1-${testName}`,
    `my-bs-2-${testName}`,
    `my-bs-3-${testName}`,
    `my-bs-4-${testName}`,
];
const ACC_KEY = "masjfasjflsajf";
const SEC_KEY = "asjflksajflk98809";
const BUCKET_NAME = "my-s3-bucket";


const nameBucketClass = async () => {
    //page -1
    await browser.wait(until.visibilityOf(bcNameInput));
    await bcNameInput.sendKeys(BC_NAME);
}

const selectTiers = async (tiers: string[]) => {
    let tier1 = null;
    switch (tiers[0]) {
        case 'Mirror': tier1 = mirrorTier1;
            break;
        default: tier1 = spreadTier1;
            break;
    }
    await tier1.click();
    if (tiers[1]) {
        let tier2 = null;
        switch (tiers[1]) {
            case 'Spread': tier2 = spreadTier2;
                break;
            case 'Mirror': tier2 = mirrorTier2;
                break;
            default: tier2 = undefined;
                break;
        };
        await addTier.click();
        await tier2.click();
    }
};

const createBS = async (name: string, provider: string = 'AWS S3', accKey: string = ACC_KEY, secKey: string = SEC_KEY, bucketName: string = BUCKET_NAME) => {
    await bsStoreName.sendKeys(name);
    if (provider === 'AWS S3') {
        await regionDropdown.click();
        await useast.click();
    }
    else {
        await providerDropdown.click();
        switch (provider) {
            case 'Azure Blob': {
                await azureBlob.click();
                break;
            }
            case 'Google cloud storage': {
                await gcs.click();
                break;
            }
            case 'S3 Compatible': {
                await s3Compatible.click();
                break;
            }
            case 'PVC': {
                await pvc.click();
                await scDropdown.click();
                await rbdClass.click();
                return await createBSinBC.click();
            }
        }
    }
    await switchToCreds.click();
    await browser.wait(until.visibilityOf(accessKey));
    await accessKey.sendKeys(accKey);
    await secretKey.sendKeys(secKey);
    await targetBucket.sendKeys(bucketName);
    await browser.wait(until.elementToBeClickable(createBtn));
    await createBSinBC.click();
}

const selectBSfromTable = async (tier1 = 'Spread', tier2: string = undefined) => {
    if (tier1 === 'Spread') {
        await browser.sleep(5000);
        await browser.wait(until.visibilityOf(tier1Option1));
        await browser.wait(until.elementToBeClickable(tier1Option1));
        await tier1Option1.click();
    }
    else if (tier1 === 'Mirror') {
        await browser.wait(until.visibilityOf(tier1Option1));
        await browser.actions().mouseMove(tier1Option1).click().perform();
        //await tier1Option1.click();
        await browser.wait(until.visibilityOf(tier1Option2));
        await tier1Option2.click();
    }
    if (tier2 === 'Spread') {
        await browser.wait(until.visibilityOf(tier2Option1));
        await tier2Option1.click();
    }
    else if (tier2 === 'Mirror') {
        await browser.wait(until.visibilityOf(tier2Option1));
        await tier2Option1.click();
        await browser.wait(until.visibilityOf(tier2Option2));
        await tier2Option2.click();
    }
}

describe('Test creation of Bucket Class(Wizard Flow)', () => {
    it('Creates a 1 tier bucket class with one ', async () => {
        //Spread with 1 backingsore
        //Creates a backingstore
        await browser.get(`${appHost}/k8s/ns/openshift-storage/operators.coreos.com~v1alpha1~ClusterServiceVersion`);
        await browser.wait(until.visibilityOf(ocsOp));
        await ocsOp.click();
        //Create BC
        await browser.wait(until.visibilityOf(bcCreateLink));
        await bcCreateLink.click();
        //page -1
        await nameBucketClass();
        await nextBtn.click();
        //page -2
        await selectTiers(['Spread']);
        await nextBtn.click();
        //page -3
        await browser.wait(until.visibilityOf(createBackingStoreModalLink));
        await createBackingStoreModalLink.click();
        //Modal
        await console.log("I am before the funciton");
        await createBS(BS_NAMES[0]);
        //Select 
        await console.log("I am before the funciton");
        await selectBSfromTable('Spread');
        await browser.wait(until.visibilityOf(nextBtn));
        await nextBtn.click();
        await createBC.click();
        await browser.sleep(5000);
        await browser.wait(until.visibilityOf(resourceItem));
        const resName = (await resourceItem.getText()).trim();
        expect(resName).toEqual(BC_NAME);
    });
});
