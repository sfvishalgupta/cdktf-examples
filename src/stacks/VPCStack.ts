import {TerraformOutput} from "cdktf";
import {S3BackendStack} from "arc-cdk";
import {Construct} from "constructs";
import * as Config from "../config";
import * as aws from "@cdktf/provider-aws";

export class VPCStack extends S3BackendStack {
    vpcStack: aws.vpc.Vpc;
    publicSubnet1: aws.subnet.Subnet;
    publicSubnet2: aws.subnet.Subnet;
    privateSubnet1: aws.subnet.Subnet;
    privateSubnet2: aws.subnet.Subnet;
    securityGroup: aws.securityGroup.SecurityGroup;

    constructor(scope: Construct, id: string, vpcConfig: aws.vpc.VpcConfig) {
        super(scope, id, Config.getS3BackendConfig(id));
        this.vpcStack = new aws.vpc.Vpc(
            this, id + 'vpc',
            vpcConfig
        );

        this.publicSubnet1 = new aws.subnet.Subnet(this,
            id + 'public-subnet-1', {
                cidrBlock: "10.0.1.0/24",
                availabilityZoneId: "use2-az1",
                vpcId: this.vpcStack.id
            });
        this.publicSubnet2 = new aws.subnet.Subnet(this,
            id + 'public-subnet-2', {
                cidrBlock: "10.0.2.0/24",
                availabilityZoneId: "use2-az2",
                vpcId: this.vpcStack.id
            });
        this.privateSubnet1 = new aws.subnet.Subnet(this,
            id + 'private-subnet-1', {
                cidrBlock: "10.0.3.0/24",
                availabilityZoneId: "use2-az1",
                vpcId: this.vpcStack.id
            });
        this.privateSubnet2 = new aws.subnet.Subnet(this,
            id + 'private-subnet-2', {
                cidrBlock: "10.0.4.0/24",
                availabilityZoneId: "use2-az2",
                vpcId: this.vpcStack.id
            });

        this.securityGroup = new aws.securityGroup.SecurityGroup(this, 'sg',
            Config.getSecurityGroupConfig(
                this.vpcStack.id,
                "sg"
            )
        );
        new TerraformOutput(this, 'vpc_arn', {
            value: this.vpcStack.arn
        });
    }
}