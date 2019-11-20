import { $, element, by } from 'protractor';

export const bcNameInput = element(by.css('[aria-label = "Bucket Class Name"]'));
export const nextBtn = element(by.buttonText("Next"));

export const spreadTier1 = $('#radio-1');
export const mirrorTier1 = $('#radio-2');

export const addTier = by.partialButtonText("Add Tier");

export const spreadTier2 = $('#radio-3');
export const mirrorTier2 = $('#radio-4');

export const option1 = element(by.css('[aria-labelledby="simple-node0]'));
export const option2 = element(by.css('[aria-labelledby="simple-node1]'));

export const createBSinBC = element(by.partialButtonText("Create BackingStore"));

export const createBC = element(by.partialButtonText("Create BucketClass"));

export const bcCreateLink = $('div > div > div:nth-child(1) > div > div > div.col-sm-9 > div > article:nth-child(7) > div.pf-c-card__footer > a');

export const searchTier1 = element(by.css('[aria-label = "Search Backing Store"]'));
export const resourceItem = $('.co-resource-item__resource-name');
//modal-names
