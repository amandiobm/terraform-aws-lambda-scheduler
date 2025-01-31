const AWS = require('aws-sdk');
const Utils = require('utils');

class Ec2Scheduler {

  constructor(awsRegion = null) {
    if (awsRegion) {
      AWS.config.update({ region: awsRegion });
    }
    this.ec2 = new AWS.EC2();
    this.autoScaling = new AWS.AutoScaling();
  }

  /**
   * AWS EC2 instance performing operation function.
   *
   * Operate EC2 instances with defined tag and disable its CloudWatch alarms.
   *
   * @param action String
   * @param resourceTags Array {key:value} pairs to use for filter resources
   * @returns {Promise<void>}
   */
  async run(action, resourceTags) {
    if (!resourceTags) {
      throw new Error('Resource tags must be specified otherwise you will shoutdown all instances');
    }

    let params = {
      //DryRun: false
      Filters: [{
        "Name": "instance-state-name",
        "Values": ["pending", "running", "stopping", "stopped"],
      }]
    };

    resourceTags.forEach((resourceTag) => {
      params.Filters.push({ "Name": "tag:" + resourceTag.Key, "Values": [resourceTag.Value] })
    });

    try {
      // Call EC2 to retrieve policy for selected bucket
      let response = await this.ec2.describeInstances(params).promise();
      for (let r = 0; r < response.Reservations.length; r++) {
        let instances = response.Reservations[r].Instances;
        for (let instance of instances) {
          let asParams = {
            InstanceIds: [instance.InstanceId]
          };

          let autoScaling = await this.autoScaling.describeAutoScalingInstances(asParams).promise();
          console.log('autoScaling', autoScaling);

          if (!autoScaling.AutoScalingInstances.length) {
            let data = await this[action](instance.InstanceId);

            console.log(`${Utils.ucFirst(action)} EC2 instance ${instance.InstanceId}`, JSON.stringify(data));
          }
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  /**
   * Stop EC2 instance by identifier
   *
   * @param instanceIdentifier
   * @returns {Promise<*>}
   */
  async stop(instanceIdentifier) {
    let params = {
      InstanceIds: [instanceIdentifier],
      //DryRun: true
    };
    return await this.ec2.stopInstances(params).promise();
  }

  /**
   * Start EC2 instance by identifier
   *
   * @param instanceIdentifier
   * @returns {Promise<*>}
   */
  async start(instanceIdentifier) {
    let params = {
      InstanceIds: [instanceIdentifier],
      //DryRun: true
    };
    return await this.ec2.startInstances(params).promise();
  }

  /**
   * Terminate EC2 instance by identifier
   *
   * @param instanceIdentifier
   * @returns {Promise<*>}
   */
  async terminate(instanceIdentifier) {
    let params = {
      InstanceIds: [instanceIdentifier],
      //DryRun: true
    };
    return await this.ec2.terminateInstances(params).promise();
  }
}

module.exports = Ec2Scheduler;
