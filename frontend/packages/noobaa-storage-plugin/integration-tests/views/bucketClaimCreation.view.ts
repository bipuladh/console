import { $, element, by } from 'protractor';

//Create OBC page
export const createOBCButton = $('button.pf-c-button.pf-m-primary');
export const scDropdown = $('.co-storage-class-dropdown');
export const storageClassDropDown = $('.co-storage-class-dropdown button');
export const defaultSC = $('#openshift-storage\\.noobaa\\.io-link');
export const createBtn = element(by.buttonText('Create'));

