import {ILambda} from 'arc-cdk';

export interface IAdvancedLambda extends ILambda {
    enableAlias?: boolean;
    aliasName?: string;
    aliasVersion?: string;
}
