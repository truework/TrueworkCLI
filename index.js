#!/usr/bin/env node

require('dotenv').config();
const { Command, Option } = require('commander');
const { mainPrompt } = require('./inquirer');
const {createVerification, getCompany, getVerification, listVerifications} = require('./twapi');
const program = new Command();

program
  .option('-v, --verbose', 'Verbose output')
  .option('--production', 'Production environment')
  .description('CLI for Truework')
  .action(() => {mainPrompt()})

const verifications = program.command('verifications');

// List Verifications
verifications
  .command('list')
  .addOption(
    new Option('--state').choices([
      'pending-approval',
      'action-required',
      'invalid',
      'processing',
      'completed',
      'canceled',
    ])
  )
  .option('-l, --limit <limit>', 'Limit the number of results', '25')
  .option('-o, --offset <offset>', 'Offset the results', '0')
  .action((options, cmd) => {listVerifications(options, cmd)}
 );

// Get Verification
verifications
  .command('get')
  .argument('<verification_id>')
  .action((verification_id) => getVerification(verification_id));


// Create Verifications
verifications
  .command('create')
  .description('Create Verification')
  .addOption(
    new Option('--type <type>', 'Request type')
      .choices(['employment-income', 'employment'])
      .default('employment')
  )
  .addOption(
    new Option(
      '--purpose <purpose>',
      'A valid purpose is required for Truework to process the verification request.'
    ).choices([
      'child-support',
      'credit-application',
      'employee-eligibility',
      'employee-request',
      'employee-review-or-collection',
      'employment',
      'insurance-underwriting-application',
      'legitimate-reason-initiated',
      'legitimate-reason-review',
      'risk-assessment',
      'subpoena',
    ])
  )
  .option('-i, --instant', 'Instant Verification', true)
  .option('-c, --credentials', 'Credentials Verification')
  .option('-s, --smart-outreach', 'Smart Outreach Verification')
  .requiredOption('-f, --first_name <first_name>', 'First Name')
  .requiredOption('-l, --last_name <last_name>', 'Last Name')
  .requiredOption('--ssn <ssn>', 'Social Security Number')
  .requiredOption('-c, --company <company>', 'Company Name')
  .option('--email [email]', 'Email')
  .option('--phone [phone]', 'Phone')
  .action((options, cmd) => createVerification(options, cmd));

program
  .command('companies')
  .description('Company queries')
  .argument('<company_name>')
  .option('-l, --limit', 'Limit the number of results', '25')
  .option('--offset')
  .action((company_name, options) => getCompany(company_name, options));

program.parse();

if (program.opts().production == true) {
  environment = 'https://api.truework.com/';
}
