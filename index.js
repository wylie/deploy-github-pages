const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const token = core.getInput('github_token');
    const octokit = github.getOctokit(token);
    const context = github.context;

    // Ensure the build directory exists
    const buildDir = path.join(process.cwd(), 'build');
    if (!fs.existsSync(buildDir)) {
      throw new Error(`Build directory ${buildDir} does not exist`);
    }

    // Configure git
    await exec.exec('git', ['config', '--global', 'user.name', 'github-actions']);
    await exec.exec('git', ['config', '--global', 'user.email', 'github-actions@github.com']);

    // Initialize a new git repository in the build directory
    process.chdir(buildDir);
    await exec.exec('git', ['init']);
    await exec.exec('git', ['add', '.']);
    await exec.exec('git', ['commit', '-m', 'Deploy to GitHub Pages']);

    // Push to the gh-pages branch
    const repo = `${context.repo.owner}/${context.repo.repo}`;
    const remoteRepo = `https://${token}@github.com/${repo}.git`;
    await exec.exec('git', ['push', '--force', remoteRepo, 'HEAD:gh-pages']);

    core.info('Deployment to GitHub Pages successful');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();