/**
 * Modular Project Detail Data Store
 * BUILTBYJIMI
 * Consumes the unified single-source-of-truth from projects-config.js
 */

import { getProjectsDetailData } from './projects-config.js';

export const PROJECTS_DETAIL_DATA = getProjectsDetailData();
