<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';

	export let authType: 'login' | 'register';

	let username: string;
	let password: string;
	let type = 'none';
	let message = '';

	let disabled = false;
	let autoFocusElement: HTMLInputElement;
	let form: HTMLFormElement;
	let animation: NodeJS.Timeout;

	let fromParam: String | null = null;
	onMount(async () => {
		const serachParams = new URLSearchParams(location.search);
		fromParam = serachParams.get('from');

		autoFocusElement.focus();
		animation = startCircleAnimation();
		await invalidateAll();
	});

	onDestroy(() => {
		if (animation) clearInterval(animation);
	});

	async function onSubmit() {
		disabled = true;

		const response = await fetch(`/api/${authType}`, {
			method: 'POST',
			headers: {
				username,
				password
			}
		});

		if (!response.ok) {
			type = 'error';
			message = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
			disabled = false;
			return;
		}

		// Update the message and type from the response
		const data = await response.json();
		type = data.type;
		message = data.message;
		disabled = false;

		if (type === 'success') {
			// Redirect to the home page. Full reload to remove recaptcha script
			if (fromParam) {
				goto(`/match/${fromParam}`);
			} else {
				goto('/');
			}
		}
	}

	function startCircleAnimation() {
		let x = 0;
		let y = 0;
		const r = 50;
		return setInterval(() => {
			x = Math.sin(Date.now() / 1000);
			y = Math.cos(Date.now() / 1000);
			form.style.boxShadow = `${x * r}px ${y * r}px 200px #646464`;
		}, 1000 / 60);
	}
</script>

<form method="post" bind:this={form} on:submit|preventDefault={onSubmit}>
	{#if authType === 'login'}
		<h1>Anmelden</h1>
		<p>Gebe dein Benutzername und Passwort ein um weiter wetten zu können.</p>
	{:else}
		<h1>Registrieren</h1>
		<p>Wähle dein Benutzername und Passwort ein auf Fußball Spiele zu wetten.</p>
	{/if}

	<div>
		<label for="username">Benutzername:</label>
		<input bind:value={username} bind:this={autoFocusElement} id="username" type="text" required autocomplete="off" />
	</div>
	<div>
		<label for="password">Passwort:</label>
		<input bind:value={password} id="password" type="password" required />
	</div>

	{#if type === 'error' || type === 'success'}
		<p class={type}>{message}</p>
	{/if}
	<button type="submit" {disabled}>{authType == 'login' ? 'Anmelden' : 'Registrieren'}</button>

	{#if authType === 'login'}
		<p>Noch kein Account? <a href="/register{fromParam ? `?from=${fromParam}` : ''}">Registrieren</a></p>
	{:else}
		<p>Schon ein Account? <a href="/login{fromParam ? `?from=${fromParam}` : ''}">Anmelden</a></p>
	{/if}
</form>

<style>
	h1 {
		color: var(--primary);
		text-transform: uppercase;
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		background-color: #646464;
		padding: 15px;
		margin: 0 10px;
		gap: 20px;
		border-radius: 25px;
		max-width: 400px;
		box-shadow: 0 0 200px #646464;
	}

	form > p {
		text-align: center;
	}

	form > p > a {
		color: var(--primary);
	}

	form > div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: calc(100% - 20px);
		margin: 0 20px;
	}

	form > div > label {
		font-weight: bold;
	}

	form > div > input {
		width: 50%;
		text-align: center;
	}

	form > button {
		color: #32cd32;
		width: 75%;
		outline: transparent;
	}

	form > button:hover {
		color: white;
		background-color: #32cd32;
	}

	form > button:focus {
		color: white;
		background-color: #32cd32;
	}

	.error {
		color: #cd3232;
	}

	.success {
		color: #32cd32;
	}

	@media (max-width: 400px) {
		form > div {
			flex-direction: column;
		}

		form > div > input {
			width: 100%;
		}

		form > button {
			width: 90%;
		}
	}
</style>
