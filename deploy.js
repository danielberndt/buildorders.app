const exec = require("@danielberndt/exec");
const path = require("path");

const CONFIG = {
  dist: path.join(__dirname, "./build"),
};

async function deployTo(opts) {
  // opts: {bucket, region}
  const sharedSyncArgs = [
    CONFIG.dist,
    `s3://${opts.bucket}`,
    "--acl public-read",
    `--region ${opts.region}`,
    "--delete",
    '--exclude "*/.DS_Store"',
  ];

  const assetArgs = [
    '--exclude "*.html"',
    '--exclude "manifest.json"',
    '--exclude "service-worker.js"',
    "--size-only",
    '--cache-control="max-age=315360000, no-transform, public"',
  ];

  await exec(`aws s3 sync ${[...sharedSyncArgs, ...assetArgs].join(" ")}`);

  const htmlArgs = [
    '--exclude "*"',
    '--include "*.html"',
    '--include "manifest.json"',
    '--include "service-worker.js"',
    '--cache-control="max-age=0, no-transform, public"',
  ];

  await exec(`aws s3 sync ${[...sharedSyncArgs, ...htmlArgs].join(" ")}`);
  // `create-invalidation` is only supported for preview version
  await exec(`aws configure set preview.cloudfront true`);
  await exec(
    `aws cloudfront create-invalidation --distribution-id ${
      opts.distributionId
    } --paths '/*.html' /manifest.json /service-worker.js`
  );
}

const deploy = async () => {
  require("dotenv").config({path: path.join(__dirname, ".env.deploy-prod")});
  // await exec("yarn build");
  deployTo({
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_BUCKET_REGION,
    distributionId: process.env.CLOUDFRONT_ID,
  });
};

deploy().then(console.log, console.error);
