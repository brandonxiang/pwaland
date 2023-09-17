<svelte:options tag="page-check"/>

<script>
import './c-navbar.svelte';
import './c-modal.svelte';
import { request, parseJson } from './utils';

let name = '';
let result = '';
let showModal = false;
let modalTitle = '';
let modalContent = '';

function checkName() {
	if(!name) {
		showModal = true;
		modalTitle = 'Error';
		modalContent = 'website url is required';
		throw new Error('website url is required');
	}
}


async function checkPwa () {
	checkName();

	const _name = name.trim().replace(/(http|https)\:\/\//, '');

	result = 'loading...'

	try {
		const json = await request(`/api/pwa-checker?url=${_name}`);
		result = JSON.stringify(json, null, 2)
	} catch (err) {
		result = err.message;
	}

}

async function addRecord () {
	checkName();
	const json = parseJson(result);
	const params = new URLSearchParams(json)
	const res = await request(`/api/add-record?${params}`).catch((e) => {
		showModal = true;
		modalTitle = 'Error';
		modalContent = e.message;
	});
	if(res) {
		console.log(res);
		showModal = true;
		modalTitle = 'Success';
		modalContent = 'This website has joined into the pwadland';
	}
}

function onModalClose () {
	showModal = false;
}

</script>

<c-navbar />

<main>
	<section>
		<input bind:value={name} placeholder="Please enter your pwa website">
		<button type="button" class="btn btn-primary" on:click={checkPwa}>Check</button>
		<button type="button" class="btn btn-primary" on:click={addRecord}>Add</button>
	</section>
	<section>
		<textarea bind:value={result} />
	</section>
	{#if showModal}
	<c-modal on:close={onModalClose}>
		<h4 slot="header">
			{modalTitle}
		</h4>
		<div>
			{modalContent}
		</div>
	</c-modal>
{/if}

	
</main>

<style>
	main {
		margin: 0;		
	}

	section {
		width: 600px;
		margin: 20px;
		display: flex;
	}

	input {
		width: 400px;
		padding:10px;
		font-size: 20px;
		flex: 1;
	}

	button {
		width: 80px;
		padding:5px 0;
		margin: 0 5px;
		font-size: 20px;
		color: white;
		background-color: rgb(77 61 146);
    border: 0;
	}

	textarea {
		font-size: 15px;
		width: 600px;
		height: 400px;
	}

</style>