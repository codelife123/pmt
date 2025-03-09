const DB_ID_CREDENTIALS = "1FzPFnnyVCDBs1SjKzlSH0gDmrF7suIW3YYF7aP80nKs"
const SN_CREDENTIALS = "Password_Login_Financials"
const SN_EMPLOYEE_PROFILE = "Employee Profile"

const DB_ID = "1tnwGYlo0ucynxGTS9uzQfixn98B3ici-_jKoT6oPjmw"
const SN_LEAVE_SUMMARY = "Unused Leave Days"
const SN_LEAVE_REPO = "Leave Requests List"
const SN_OKRS = "OKRs"

const TEMPLATE_ID_SALARY_CERTIFICATE = "1hX0DHy0T9H1ZjFUe-WGWO86upNFeM8Rca6bT63ezOVo"
const FN_DOCUMENTS = "HR Documents"

class App {
    constructor() {
        this.db = SpreadsheetApp.openById(DB_ID)
        this.dbCredentials = SpreadsheetApp.openById(DB_ID_CREDENTIALS)
        this.templateSalaryCertificate = DriveApp.getFileById(TEMPLATE_ID_SALARY_CERTIFICATE)
        this.rootFolder = this.templateSalaryCertificate.getParents().next()
    }

    getKeysIconsLabelsValues(ws) {
        const [keys, icons, labels, ...values] = ws.getDataRange().getValues()
        keys.forEach((_, i) => {
            keys[i] = keys[i].toString().trim()
            icons[i] = icons[i].toString().trim()
            labels[i] = labels[i].toString().trim()
        })
        return {
            keys,
            icons,
            labels,
            values,
        }
    }

    getFolderByName(name, rootFolder) {
        const folders = rootFolder.getFoldersByName(name)
        if (folders.hasNext()) return folders.next()
        return rootFolder.createFolder(name)
    }

    getItems(sheetname, spreadsheetId) {
        const ss = SpreadsheetApp.openById(spreadsheetId)
        const ws = ss.getSheetByName(sheetname)
        const { keys, icons, labels, values } = this.getKeysIconsLabelsValues(ws)
        keys.forEach((key, i) => {
            keys[i] = keys[i].toString().trim()
            labels[i] = labels[i].toString().trim()
            icons[i] = icons[i].toString().trim()
        })
        const items = values.map(v => {
            const item = {}
            v.forEach((value, i) => item[keys[i]] = value)
            return item
        })
        return { labels, icons, keys, items }
    }

    getItemsByEmail(email, sheetname, spreadsheetId) {
        let { labels, icons, keys, items } = this.getItems(sheetname, spreadsheetId)
        items = items.filter(item => item.email.toString().trim().toLowerCase() === email)
        return { labels, icons, keys, items }
    }

    getItemByEmail(email, sheetname, spreadsheetId) {
        const { labels, icons, keys, items } = this.getItems(sheetname, spreadsheetId)
        const item = items.find(item => item.email.toString().trim().toLowerCase() === email)
        return { labels, icons, keys, item }
    }

    getUserByEmail(email) {
        const user = this.getItemByEmail(email, SN_EMPLOYEE_PROFILE, DB_ID_CREDENTIALS)
        const credential = this.getItemByEmail(email, SN_CREDENTIALS, DB_ID_CREDENTIALS)
        user.credential = credential
        if (user.item) return user
        const item = { email }
        user.item = this.createItem(item, SN_EMPLOYEE_PROFILE, DB_ID_CREDENTIALS)
        return user
    }

    getAppData(token) {
        const app = {
            name: APP_NAME,
            icons: {},
            labels: {},
            leaveTypes: ["Vacation leave", "Sick leave", "Parental Leave"],
        }
        // return app data if there is no token
        if (!token) return { app, user: null }

        const email = validateToken(token)
        // return app data if the token is invalid
        if (!email) return { app, user: null }

        const user = this.getUserByEmail(email)

        // return app data if the user is not found
        if (!user.item) return { app, user: null }

        user.leaveSummary = this.getItemByEmail(email, SN_LEAVE_SUMMARY, DB_ID)
        user.leaves = this.getItemsByEmail(email, SN_LEAVE_REPO, DB_ID)
        user.okrs = this.getItemsByEmail(email, SN_OKRS, DB_ID)
        return { app, user }
    }

    createItem(item, sheetname, spreadsheetId) {
        const ss = SpreadsheetApp.openById(spreadsheetId)
        const ws = ss.getSheetByName(sheetname)
        const { keys } = this.getKeysIconsLabelsValues(ws)
        item.uuid = Utilities.getUuid()
        const rowContents = keys.map(key => {
            const value = item[key]
            const date = new Date(value)
            if (value == undefined) return null
            if (date.toString() !== "Invalid Date") {
                if (date.toISOString() === value) return date
                return value
            }
            return value
        })
        ws.appendRow(rowContents)
    }

    updateItemByUuid(item, sheetname, spreadsheetId) {
        const ss = SpreadsheetApp.openById(spreadsheetId)
        const ws = ss.getSheetByName(sheetname)
        const { keys, values } = this.getKeysIconsLabelsValues(ws)
        const uuidIndex = keys.indexOf("uuid")
        const rowIndex = values.findIndex(v => v[uuidIndex] === item.uuid)
        if (rowIndex !== -1) {
            keys.forEach((key, colIndex) => {
                const value = item[key]
                if (value != null) {
                    const date = new Date(value)
                    if (date.toString() !== "Invalid Date") {
                        if (date.toISOString() === value) {
                            ws.getRange(rowIndex + 4, colIndex + 1).setValue(date)
                        } else {
                            ws.getRange(rowIndex + 4, colIndex + 1).setValue(value)
                        }
                    } else {
                        ws.getRange(rowIndex + 4, colIndex + 1).setValue(value)
                    }
                }
            })
        }
    }

    updateItemByEmail(item, sheetname, spreadsheetId) {
        const ss = SpreadsheetApp.openById(spreadsheetId)
        const ws = ss.getSheetByName(sheetname)
        const { keys, values } = this.getKeysIconsLabelsValues(ws)
        const emailIndex = keys.indexOf("email")
        const rowIndex = values.findIndex(v => v[emailIndex] === item.email)
        if (rowIndex !== -1) {
            keys.forEach((key, colIndex) => {
                const value = item[key]
                if (value != null) {
                    const date = new Date(value)
                    if (date.toString() !== "Invalid Date") {
                        if (date.toISOString() === value) {
                            ws.getRange(rowIndex + 4, colIndex + 1).setValue(date)
                        } else {
                            ws.getRange(rowIndex + 4, colIndex + 1).setValue(value)
                        }
                    } else {
                        ws.getRange(rowIndex + 4, colIndex + 1).setValue(value)
                    }
                }
            })
        }
    }

    editItem(item, sheet) {
        const ss = SpreadsheetApp.openById(spreadsheetId)
        const ws = ss.getSheetByName(sheetname)
        const { keys, values } = this.getKeysIconsLabelsValues(ws)
        const findItem = values
    }

    downloadSalaryCertificate(email) {
        const credential = this.getItemByEmail(email, SN_CREDENTIALS, DB_ID_CREDENTIALS).item
        const user = this.getUserByEmail(email).item
        // const folder = this.getFolderByName(FN_DOCUMENTS, this.rootFolder)
        const copyFile = this.templateSalaryCertificate.makeCopy(this.rootFolder)

        const copyDoc = DocumentApp.openById(copyFile.getId())
        const body = copyDoc.getBody()
        const userName = [user.name, user.middleName, user.surName].filter(v => v != "").join(" ")

        const filename = `Salary Certificate - ${userName}`

        const placeholders = {
            today: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy"),
            title: user.title,
            userName,
            passportNumber: user.passportNumber,
            startDate: Utilities.formatDate(new Date(credential.startDate), Session.getScriptTimeZone(), "dd/MM/yyyy"),
            position: credential.position,
            salaryTotal: credential.salaryTotal,
        }
        Object.keys(placeholders).forEach(key => {
            if (placeholders[key] != null) body.replaceText(`{{${key}}}`, placeholders[key])
        })

        copyDoc.saveAndClose()

        const blob = copyDoc.getAs(MimeType.PDF).setName(filename)
        // const pdf = folder.createFile(blob)
        copyFile.setTrashed(true)
        GmailApp.sendEmail(email, filename, "", { htmlBody: `<p>Dear ${userName},</p><p>Please find attached the salary certificate.</p>`, attachments: [blob], name: 'Salary Certificate' })

        // return { name: pdf.getName(), url: pdf.getUrl() }
    }

    sendApprovalEmail(item){
      const fullName = item.fullName
      const startDate = new Date(item.startDate).toLocaleDateString()
      const endDate = new Date(item.endDate).toLocaleDateString()
      const leaveType = item.leaveType

      const recipient = item.managers
      const subject = `${fullName} ${leaveType} Request`
      const options = {
        name: "DF Leave Requests",
        cc: item.email,
        htmlBody: `
          <p>Dear Manager,</p>
          <p>
            This is to inform that ${fullName} has requested a ${leaveType} for following period:<br>
            Start date: ${startDate}<br>
            End date: ${endDate}<br>
            Kindly confirm acceptance by replying to this email.
          </p>
        `
      }
      GmailApp.sendEmail(recipient, subject, "", options)
    }

    signIn(email, password) {
        email = email.toString().trim().toLowerCase()
        password = password.toString().trim()

        const credential = this.getItemByEmail(email, SN_CREDENTIALS, DB_ID_CREDENTIALS)
        if (!credential.item) return { user: null }
        const correctPassword = credential.item.password.toString().trim()
        if (correctPassword !== password) return { user: null }

        const user = this.getUserByEmail(email)
        const token = createToken(email)
        user.token = token

        user.leaveSummary = this.getItemByEmail(email, SN_LEAVE_SUMMARY, DB_ID)
        user.leaves = this.getItemsByEmail(email, SN_LEAVE_REPO, DB_ID)
        user.okrs = this.getItemsByEmail(email, SN_OKRS, DB_ID)
        return { user }
    }

    signOut(token) {
        destroyToken(token)
    }
}


