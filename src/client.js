

const video = document.getElementById('video');
const videoSrc = '/stream/out.m3u8';

if (Hls.isSupported()) {
    const hls = new Hls();

    hls.loadSource(videoSrc);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
        //video.play();
    });
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
}






document.addEventListener('DOMContentLoaded', function () {
    const fileList = document.getElementById('file-list');
    const videoElement = document.getElementById('video');
    const toggleButton = document.getElementById('toggle-button');

    // Simulated file data (replace this with actual data from the server)
    // JavaScript code in your HTML file or a separate script file
    async function getListOfFiles() {
        try {
            const response = await fetch('/files'); // Assuming your Express server is running on the same host
            if (response.ok) {
                const files = await response.json();
                return files;
            } else {
                console.error('Error retrieving files:', response.statusText);
                return {};
            }
        } catch (error) {
            console.error('Error:', error);
            return {};
        }
    }

    // Call the function to get the list of files
    let files;
    let filesProm = getListOfFiles();
    filesProm
        .then((files_) => {
            files = files_;
            renderFileList(files);
        })
        .catch((error) => { console.log(error); })


    // Function to render file list
    function renderFileList() {
        fileList.innerHTML = '';
        file_index = 0;
        folder_index = 0;
        files.forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'file-list-item';
            const link = document.createElement('a');
            link.href = '#'; // You can set the actual file path here
            link.textContent = file.name;
            if (file.type == "folder")
                link.id = file.type + folder_index;
            else
                link.id = file.type + file_index;

            listItem.appendChild(link);
            // // Add a separator (hr element) between each list item except the last one
            // if (index < files.length - 1) {
            //     listItem.appendChild(document.createElement('hr'));
            // }
            fileList.appendChild(listItem);
            if (file.type == "folder")
                folder_index++;
            else
                file_index++;
        });
    }

    // Function to toggle visibility of file list and video element
    function toggleElements() {
        if (fileList.style.display === 'none') {
            fileList.style.display = 'block';
            videoElement.style.display = 'none';
            toggleButton.textContent = 'Show Video';
        } else {
            fileList.style.display = 'none';
            videoElement.style.display = 'block';
            toggleButton.textContent = 'Show File Browser';
        }
    }

    // Add event listener to the toggle button
    toggleButton.addEventListener('click', toggleElements);
    //renderFileList();
});





const seekSlider = document.getElementById('seek-slider');
const sliderValueDisplay = document.getElementById('slider-value');
let debounceTimeout;
let bSeeking = false;

seekSlider.addEventListener('input', function () {
    // Clear the previous debounce timeout
    clearTimeout(debounceTimeout);

    bSeeking = true;
    console.log("Range input clicked!", bSeeking);
    // Set a new debounce timeout
    debounceTimeout = setTimeout(() => {
        const sliderValue = seekSlider.value;
        sliderValueDisplay.textContent = `Slider Value: ${sliderValue}`;

        // Make a POST request to the server
        fetch('/mpv-seek', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sliderValue: sliderValue }),
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the server if needed
                console.log('Server response:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            }).finally(() => { 
                video.currentTime = video.duration-1;
                bSeeking = false; 
            });
    }, 500); // Debounce time in milliseconds (e.g., 300ms)
});



document.getElementById('triggerButton').addEventListener('click', async () => {
    try {
        // Make a fetch request to the API endpoint
        const response = await fetch('/mpv-pause-cycle', {
            method: 'POST',
        });

        // Parse the JSON response
        const data = await response.json();

        // Update the result div with the response message
        document.getElementById('result').innerText = data.message;
    } catch (error) {
        // Handle errors, if any
        console.error('Error:', error);
        document.getElementById('result').innerText = 'Error occurred. Please try again.';
    }
});



async function makeRequest() {
    try {
        // console.log("mreq ", bSeeking)
        if (!bSeeking) {
            const response = await fetch('/mpv-get-perc-pos');
            const data = await response.json();
            document.getElementById('seek-slider').value = data.number;
            console.log(typeof (data));
        }
        else console.log("seeking, get perc pos aborted")
    } catch (error) {
        console.error('Error:', error);
    }
}

//makeRequest();
setInterval(makeRequest, 2000);
