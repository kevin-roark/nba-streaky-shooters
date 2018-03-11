import { WebDataManager } from 'nba-netdata/dist/web-data-manager'
import { staticDataPathPrefix } from './config'

export const webDataManager = WebDataManager.fromPathPrefix(staticDataPathPrefix)
