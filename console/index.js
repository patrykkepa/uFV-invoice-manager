#!/usr/bin/env node

/**
 * fv_console
 * CLI for managing client-server app
 *
 * @author Unknown <p>
 */

const init = require('./utils/init')
const cli = require('./utils/cli')
const log = require('./utils/log')
const axios = require('axios')
const prompt = require('prompt-sync')()
const chalk = require('chalk')
var crypto = require('crypto')
var Table = require('cli-table');
var moment = require('moment')

// node cli setup
const input = cli.input
const flags = cli.flags
const { clear, debug } = flags

// unlimited listeners
process.setMaxListeners(0);

// axios and cookies setup
function createAxios() {
	return axios.create({withCredentials: true});
}
const axiosInstance = createAxios();
const cookieJar = {
	myCookies: undefined,
};


// *** VARIABLES ***
let width = 22
let login
let password
let passwordHash
let updateName, updateEmail, updatePassword, updatePasswordRep
let uuid
let whoami
let organization
let profile
let fvArr
let fvItem
var number, status, date, netto, gross, field, company
var searchKey, searchValue, deleteValue
const login_url = 'http://localhost:8080/auth'
const changePassword_url = 'http://localhost:8080/rest/changePassword'
const profile_url = 'http://localhost:8080/rest/profile'
const fv_url = 'http://localhost:8080/rest/fv'





// *** UI ***
function welcomeUI(){
	console.log("                   Login                   ")
	console.log("===========================================\n")
}

async function loginUI(){
	login = prompt(chalk.cyan('  Login: '))
	password = prompt(chalk.cyan('  Password: '), {echo: '*'})
	passwordHash = crypto.createHash('sha256').update(password).digest('base64')
	await handle_login()
	await handle_getProfile()
}

function profileUI(){
	var tmpProfile = profile
	console.log("             Your profile data             ")
	console.log("===========================================")
	var table = new Table({
    head: ['NAME', 'EMAIL'],
  	colWidths: [30, 50]
	});
	table.push(
    [`${tmpProfile.value['fullName']}`, `${tmpProfile.value['email']}`]
);
	console.log(table.toString())
}

function menuUI(){
	console.log('\n\n-------------------MENU-------------------')
	console.log(`  ${chalk.green('[1]')} -- Add new FV`)
	console.log(`  ${chalk.blue('[2]')} -- Show all FV`)
	console.log(`  ${chalk.blue('[3]')} -- Search for FV`)
	console.log(`  ${chalk.yellow('[4]')} -- Delete FV`)
	console.log(`  ${chalk.cyan('[5]')} -- Profile info`)
	console.log(`  ${chalk.cyan('[6]')} -- Update profile`)
	console.log(`  ${chalk.cyan('[7]')} -- Change password`)
	console.log(`  ${chalk.red('[8]')} -- Exit`)
	console.log('------------------------------------------')
	handle_menu()
}

function allFVUI(){
	var tmpFvArr = fvArr
	console.log("                 ALL FV's                  ")
	console.log("===========================================")
	var table = new Table({
    head: ['NUMBER', 'STATUS', 'DATE', 'NET', 'GROSS', 'FIELD', 'COMPANY', 'AUTHOR', 'UPLOAD_DATE'],
  	colWidths: [20,15,15,15,15,15,15,15,15]
	});
	tmpFvArr.forEach(el => {
		table.push(
			[`${el['number']}`,`${el['status']}`, `${el['date']}`, `${el['net_amount']}`, `${el['gross_amount']}`, `${el['field']}`, `${el['company']}`, `${el['author']}`, `${el['upload_date']}`]
		)
	})
	console.log(table.toString())
}

function filteredFVUI(){
	var tmpFvArr = fvItem
	console.log("               SEARCHED FV's               ")
	console.log("===========================================")
	var table = new Table({
    head: ['NUMBER', 'STATUS', 'DATE', 'NET', 'GROSS', 'FIELD', 'COMPANY', 'AUTHOR', 'UPLOAD_DATE'],
  	colWidths: [20,15,15,15,15,15,15,15,15]
	});
	tmpFvArr.forEach(el => {
		table.push(
			[`${el['number']}`,`${el['status']}`, `${el['date']}`, `${el['net_amount']}`, `${el['gross_amount']}`, `${el['field']}`, `${el['company']}`, `${el['author']}`, `${el['upload_date']}`]
		)
	})
	console.log(table.toString())
}

async function addFVUI(){
	var tmpFvArr = fvArr
	console.log("                  ADD FV                   ")
	console.log("===========================================")

	number = prompt(chalk.cyan('  Number: '))
	while(tmpFvArr.filter(el => el.number == number).length > 0){
		number = prompt(chalk.cyan('  Number: '))
	}

	status = prompt(chalk.cyan('  Status [paid/unpaid]: '))
	if (!(status == 'paid' || status == 'unpaid')) status = '---'

	date = prompt(chalk.cyan('  Date [yyyy/mm/dd]: '))
	if(!(moment(date, 'YYYY/MM/DD', true).isValid())) date = '---'

	netto = prompt(chalk.cyan('  Netto amount: '))
	if (isNaN(netto)) netto = '---'

	gross = prompt(chalk.cyan('  Gross amount: '))
	if (isNaN(gross)) gross = '---'

	field = prompt(chalk.cyan('  Field: '))
	company = prompt(chalk.cyan('  Company: '))
	await handle_addFV()
}

async function searchFVUI(){
	let availableKeys = ['author','number','date','status']
	init({ clear })
	console.log("                 SEARCH FV                 ")
	console.log("===========================================")
	searchKey = prompt(chalk.cyan('  Enter preferred filter [author / number / date / status]:  '))
	searchValue = prompt(chalk.cyan('  Enter the search phrase:  '))
	if(!availableKeys.includes(searchKey)){
			init({ clear })
			await handle_getAllFV()
			console.log(chalk.red("No matching data."))
			allFVUI()
			menuUI()
	} else {
		init({ clear })
		await handle_searchFV()
		filteredFVUI()
		menuUI()
	}
}

async function deleteFVUI(){
	init({ clear })
	console.log("                 DELETE FV                 ")
	console.log("===========================================")
	deleteValue = prompt(chalk.cyan('  Enter FV number:  '))
	await handle_deleteFV()
}

async function updateProfileUI(){
	init({ clear })
	console.log("               UPDATE PROFILE              ")
	console.log("===========================================")
	updateName = prompt(chalk.cyan('  Enter full name:  '))
	updateEmail = prompt(chalk.cyan('  Enter email:  '))
	await handle_updateProfile()
}

async function updatePasswordUI(){
	init({ clear })
	console.log("              CHANGE PASSWORD              ")
	console.log("===========================================")
	console.log(chalk.gray("  Must contain: 8 characters | big letter | number | special char\n"))
	updatePassword = prompt(chalk.cyan('  Enter new password:  '))
	updatePasswordRep = prompt(chalk.cyan('  Repeat password:  '))
	if(!(updatePassword == updatePasswordRep)){
		init({ clear })
		console.log(chalk.red('Password do not match.'))
		console.log(chalk.red('Could not update password.\n'))
	}else{
		await handle_updatePassword()
	}
}




// *** HANDLERS ***

handle_menu = async () => {
	let choice = prompt('Choose an option: ')
	switch (choice) {
		case '1':
			init({ clear })
			await handle_getAllFV()
			await addFVUI()
			await handle_getAllFV()
			allFVUI()
			menuUI()
			break
		case '2':
			init({ clear })
			await handle_getAllFV()
			allFVUI()
			menuUI()
			break
		case '3':
			init({ clear })
			await searchFVUI()
			break
		case '4':
			init({ clear })
			await handle_getAllFV()
			await deleteFVUI()
			await handle_getAllFV()
			allFVUI()
			menuUI()
			break
		case '5':
			init({ clear })
			profileUI()
			menuUI()
			break
		case '6':
			init({ clear })
			await updateProfileUI()
			await handle_getProfile()
			profileUI()
			menuUI()
			break
		case '7':
			init({ clear })
			await updatePasswordUI()
			profileUI()
			menuUI()
			break
		case '8':
			await handle_logout()
			break
		default:
			handle_menu()
	}
}

handle_login = async () => {
	let payload = {
		username:login,
		password:password
	}
	whoami = await axios.post(login_url, payload)
		.then(res => {
			cookieJar.myCookies = res.headers['set-cookie']
			init({ clear })
			uuid = res.data['uuid']
			return res.data
		})
		.catch(err => {
			if (err.code === 'ECONNREFUSED'){
				server_unavailable()
			}else {
				init({ clear })
				welcomeUI()
				console.log(chalk.red('Bad login or password.\n'))
				process.exit()
			}
		})
}

handle_logout = async () => {
	if(profile == null){
		console.log(chalk.green('Closing program.'))
		process.exit()
	}else{
		const logout = await axios.delete(login_url, {
			headers: {
				cookie: cookieJar.myCookies
			}
		})
			.then(res => {
				init({ clear })
				console.log(chalk.green('You are logged out.'))
				return res.data
			})
			.catch(err => {
				if (err.code === 'ECONNREFUSED'){
					server_unavailable()
				}else{
					init({ clear })
					process.exit()
				}
			})
	}
}

handle_getProfile = async () => {
	profile = await axios.get(profile_url, {
		headers: {
			cookie: cookieJar.myCookies
		}
	})
		.then(res => res.data)
		.catch(err => {
			if (err.code === 'ECONNREFUSED'){
				server_unavailable()
			} else {
				init({ clear })
				console.log(chalk.red('Could not get profile data.\n'))
				handle_logout()
			}
		})
}

handle_getAllFV = async () => {
	fvArr = await axios.get(fv_url, {
		headers: {
			cookie: cookieJar.myCookies
		}
	})
		.then(res => res.data.value)
		.catch(err => {
			if (err.code === 'ECONNREFUSED'){
				server_unavailable()
			}else{
				init({ clear })
				console.log(chalk.red('Could not get FV\'s data.\n'))
				profileUI()
			}
		})
}

handle_addFV = async () => {
	var tmpFvArr = fvArr
	let date_ob = new Date()
	var payload = {
		value: []
	}

	tmpFvArr.forEach(el => payload.value.push(el))

	var month = date_ob.getMonth().toString().length == 2 ? date_ob.getMonth()+1 : `0${date_ob.getMonth()+1}`
	var day = date_ob.getDate().toString().length == 2 ? date_ob.getDate() : `0${date_ob.getDate()}`
	
	payload.value.push({
		author: profile.value['fullName'],
		upload_date: `${date_ob.getFullYear()}/${month}/${day}`,
		date: date.trim().toString(),
		net_amount: netto.trim().toString(),
		gross_amount: gross.trim().toString(),
		status: status.trim().toString(),
		company: company.trim().toString(),
		field: field.trim().toString(),
		number: number.trim().toString()
	})

	var addedFv = await axios.put(fv_url, payload, {
		headers: {
			cookie: cookieJar.myCookies
		}
	})
	.then(res => {
		init({ clear })
		return res.data
	})
	.catch(err => {
		if (err.code === 'ECONNREFUSED'){
			server_unavailable()
		}else{
			init({ clear })
			console.log(chalk.red("Adding FV failed.\n"))
		}
	})
}

handle_searchFV = async () => {
	var payload = {
		key: searchKey,
		value: searchValue
	}

	fvItem = await axios.post(fv_url, payload, {
		headers: {
			cookie: cookieJar.myCookies
		}
	})
		.then(res => res.data.value)
		.catch(err => {
			if (err.code === 'ECONNREFUSED'){
				server_unavailable()
			}else{
				init({ clear })
				console.log(chalk.red("Searching FV failed.\n"))
				console.log(err)
			}
		})
}

handle_deleteFV = async () => {
	var tmpFvArr = fvArr
	var newFvArr = tmpFvArr.filter((el) => {
		return el.number != deleteValue
	})
	var payload = {
		value: newFvArr
	}
	var response = await axios.put(fv_url, payload, {
		headers: {
			cookie: cookieJar.myCookies
		}
	})
		.then(res => {
			init({ clear })
			return res.data.value
		})
		.catch(err => {
			if (err.code === 'ECONNREFUSED'){
				server_unavailable()
			}else{
				init({ clear })
				console.log(chalk.red('Could not delete FV.\n'))
				allFVUI()
			}
		})
}

handle_updateProfile = async () => {
	let payload = {
		value: {
			fullName:updateName.trim(),
			email:updateEmail.trim()
		}
	}
	var updatedProfile = await axios.put(profile_url, payload, {
		headers: {
			cookie: cookieJar.myCookies
		}
	})
		.then(res => {
			init({ clear })
			return res.data
		})
		.catch(err => {
			if (err.code === 'ECONNREFUSED'){
				server_unavailable()
			}else{
				init({ clear })
				console.log(chalk.red('Could not update profile.\n'))
			}
		})
}

handle_updatePassword = async () => {
	let payload = {
		uuid: uuid,
		password: updatePassword
	}
	var updatedPassword = await axios.put(changePassword_url, payload, {
		headers: {
			cookie: cookieJar.myCookies
		}
	})
		.then(res => {
			init({ clear })
			return res.data
		})
		.catch(err => {
			if (err.code === 'ECONNREFUSED'){
				server_unavailable()
			}else{
				init({ clear })
				console.log(chalk.red('Could not update password.\n'))
			}
		})
}

server_unavailable = () => {
	init({ clear })
	console.log(chalk.red('Server out of service. Try again later\n'))
	cookieJar.myCookies = undefined
	process.exit()
}




// RUN
(async () => {
	init({ clear })
	input.includes(`help`) && cli.showHelp(0)
	debug && log(flags)

	welcomeUI()
	await loginUI()
	profileUI()
	menuUI()


})()


