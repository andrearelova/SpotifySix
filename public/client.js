const form = document.querySelector('form');
const API_URL = 'http://localhost:5000/submissions';

form.addEventListener('submit', (event) => {
	event.preventDefault();
	const formData = new FormData(form);
	var artist1 = formData.get('artist1');
	var artist2 = formData.get('artist2');

	const post = {
		artist1,
		artist2
	};

	// instead of POSTing to the API_URL, we could just do all the stuff on client side
	fetch(API_URL, {
			method: 'POST',
			body: JSON.stringify(post),
			headers: {
				'content-type': 'application/json'
			}
		}).then(response => response.json())
		.then(submittedArtists => {
			console.log(submittedArtists);
			form.reset();
		});
});
