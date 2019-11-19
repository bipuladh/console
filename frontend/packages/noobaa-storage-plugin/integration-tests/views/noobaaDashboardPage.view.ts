import { $ } from 'protractor';

export const obcCount = $('.nb-buckets-card__row-title > div:nth-child(1)');
export const obCount = $('.nb-buckets-card__row-title > div:nth-child(0)')

export const clusterHealth = $('.co-status-card__health-body > div > div:nth-child(1) > div > div:nth-child(2) > div');
export const efficiencyValue = $('.nb-buckets-card__row-status-item > span');
export const savingsValue = $('div:nth-child(2) > div.nb-object-data-reduction-card__row-status-item > span');
