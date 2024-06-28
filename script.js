const passwordsTableBody = document.getElementById("passwordsTableBody");

const passwordForm = document.getElementById("passwordForm");
const passwordRange = document.getElementById("passwordRange");
const passwordField = document.getElementById("password");

const eyeIcon = document.getElementById("eyeIcon");
const deleteRecords = document.getElementById("deleteRecords");
const selectAllCheck = document.getElementById("selectAll");

selectAllCheck.addEventListener("change", (event) => {
	document.querySelectorAll('input[type="checkbox"][name="record"]').forEach((checkbox) => {
		checkbox.checked = event.target.checked;
	});
});

deleteRecords.addEventListener("click", () => {
	const rowsToDelete = [];
	document.querySelectorAll('input[type="checkbox"][name="record"]:checked').forEach((checkbox) => {
		rowsToDelete.push(checkbox.closest("tr").rowIndex - 1);
	});
	rowsToDelete.sort((a, b) => b - a);
	rowsToDelete.forEach((index) => {
		passwordsTableBody.deleteRow(index);
		deletePassword(index);
	});
	selectAllCheck.checked = false;
});

function fixURL(urlInput) {
	if (urlInput.value.length > 0 && !urlInput.value.includes("://")) {
		urlInput.value = "https://" + urlInput.value;
	}
}

const uppercase = document.getElementById("uppercase");
const lowercase = document.getElementById("lowercase");
const numbers = document.getElementById("numbers");
const symbols = document.getElementById("symbols");
const excludeSimilar = document.getElementById("exclude-similar");

[uppercase, lowercase, numbers, symbols, excludeSimilar].forEach((checkbox) => {
	checkbox.addEventListener("change", () => generatePassword());
});

function createPassword(length, charactersArray) {
	const characters = charactersArray.join("");

	function generatePassword() {
		return Array.from(crypto.getRandomValues(new Uint32Array(length)))
			.map((x) => characters[x % characters.length])
			.join("");
	}

	function passwordIsValid(password) {
		return charactersArray.every((group) => group.split('').some((char) => password.includes(char)));
	}

	let password;
	do {
		password = generatePassword();
	} while (!passwordIsValid(password));

	return password;
}

const similarCharacters = "iloIO01"; // '|'

function filterSimilarCharacters(str) {
	return str.split('').filter(char => !similarCharacters.includes(char)).join('');
}

function generatePassword() {
	let charactersArray = [];

	if (uppercase.checked) charactersArray.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
	if (lowercase.checked) charactersArray.push("abcdefghijklmnopqrstuvwxyz");
	if (numbers.checked) charactersArray.push("0123456789");
	if (symbols.checked) charactersArray.push("#$%&@^`~");

	if (charactersArray.length === 0) return;
	if (excludeSimilar) charactersArray = charactersArray.map(group => filterSimilarCharacters(group));

	passwordField.value = createPassword(passwordRange.valueAsNumber, charactersArray);

	if (passwordField.getAttribute("type") === "password") {
		passwordField.setAttribute("type", "text");
		eyeIcon.innerHTML = '<i class="fas eye" title="Hide Password"></i>';
	}
}

function getPasswordField(element) {
	return element.closest(".password-container").querySelector("input");
}

function togglePassword(element) {
	const passwordField = getPasswordField(element);

	const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
	passwordField.setAttribute("type", type);

	element.innerHTML = type === "password" 
		? '<i class="fas eye-slash" title="Show Password"></i>' 
		: '<i class="fas eye" title="Hide Password"></i>';

	type === "text" ? passwordField.focus() : 0;
}

function copyPassword(element) {
	const passwordField = getPasswordField(element);
	navigator.clipboard.writeText(passwordField.value);

	let tmpChange = false;
	const tmpValue = passwordField.value;

	element.classList.add("disabled-span");
	passwordField.value = "Copied!";

	if (passwordField.getAttribute("type") === "password") {
		passwordField.setAttribute("type", "text");
		tmpChange = true;
	}

	setTimeout(() => {
		passwordField.value = tmpValue;
		tmpChange ? passwordField.setAttribute("type", "password") : 0;
		element.classList.remove("disabled-span");
		passwordField.focus();
	}, 200);
}

function recordCheck(element) {
	selectAllCheck.checked = element.checked
		? document.querySelectorAll('input[type="checkbox"][name="record"]:checked').length === passwordsTableBody.rows.length
		: !(document.querySelectorAll('input[type="checkbox"][name="record"]').length === passwordsTableBody.rows.length);
}

function loadPasswords() {
	passwordsTableBody.innerHTML = "";
	const passwords = JSON.parse(localStorage.getItem("passwords")) || [];

	if (passwords.length > 0) {
		passwords.forEach((password, index) => {
			const row = document.createElement("tr");
			row.innerHTML = `
				<td><input type="checkbox" onclick="recordCheck(this)" name= "record" id="${index}"/></td>
				<td>${password.login}</td>
				<td>
					<div class="password-container">
						<input type="password" value="${password.password}" readonly>
						<span class="firstIcon" onclick="copyPassword(this)">
							<i class="fas copy" title="Copy password"></i>
						</span>
						<span class="secondIcon" onclick="togglePassword(this)">
							<i class="fas eye-slash" title="Show Password"></i>
						</span>
					</div>
				</td>
				<td><a href="${password.url}" target="_blank">${password.url}</a></td>
			`;
			passwordsTableBody.appendChild(row);
		});
	} else {
		const row = document.createElement("tr");
		row.innerHTML = '<td colspan="4" style="text-align: center;">Table is empty</td>';
		passwordsTableBody.appendChild(row);
	}

	deleteRecords.hidden = passwords.length === 0;
	selectAll.disabled = passwords.length === 0;
}

function addPassword(login, password, url) {
	const passwords = JSON.parse(localStorage.getItem("passwords")) || [];
	passwords.push({ login, password, url });
	localStorage.setItem("passwords", JSON.stringify(passwords));
	loadPasswords();
}

function deletePassword(index) {
	const passwords = JSON.parse(localStorage.getItem("passwords")) || [];
	passwords.splice(index, 1);
	localStorage.setItem("passwords", JSON.stringify(passwords));
	loadPasswords();
}

passwordForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const login = document.getElementById("login").value;
	const password = document.getElementById("password").value;
	const url = document.getElementById("url").value;
	addPassword(login, password, url);
	passwordForm.reset();
});

if (navigator.serviceWorker) {
	navigator.serviceWorker.register("sw.js")
	.catch((err) => {
		console.log('ServiceWorker registration failed: ', err);
	});
}

["img/eye.svg", "img/copy.svg"].forEach((url) => {
	var img = new Image();
	img.src = url;
});

loadPasswords();