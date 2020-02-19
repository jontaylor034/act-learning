$(()=>{
    let courseManifest;
    let courseId;
    let currentStep = 1;

    const loadManifest= () =>{
        return new Promise((resolve, reject) =>{
            $.get('../content/manifest.json', (manifest) =>{
                if (manifest){
                    let params = readParamsFromUrl();

                    if (params){
                        console.log(params);
                        courseId = params.id;
                    }

                    if (courseId){
                        let courseMatched = false;
                        for (const i in manifest.courses){
                            let course = manifest.courses[i];
                            console.log(course)
                            if (course.id == courseId){
                                courseMatched = true;
                                courseManifest = course;
                                break
                            }
                        }
                        if (courseMatched){
                            loadCourse(courseManifest);
                        } else {
                            displayErrorPage("Whoops, look like this course is not available...")
                        }
                    } else {
                        displayErrorPage("Whoops, looks like the URL was invalid...");
                    }
                } else {
                    displayErrorPage("Uh oh, something went wrong...");
                }
                console.log("fetch successful", manifest);
            });
        });
    }

    loadManifest();

    const displayErrorPage = (err) =>{
        console.error(err);
        //TODO: Handle errors with page styling
    }

    const readParamsFromUrl = () =>{
        let params = {};
        let paramString = window.location.href.split("?")[1];
        console.log(paramString);
        if (paramString){
            let paramSplit = paramString.split("&");
            for (const paramPair in paramSplit){
                let key = paramSplit[paramPair].split("=")[0];
                let val = paramSplit[paramPair].split("=")[1];
                params[key] = val;
            }
            return params;
        } else {
            return null;
        }
    }

    const loadCourse = (course) =>{
        console.log("Loading course...", course);
        let loadStep = course.steps[currentStep-1];
        $('.course-title').text(course.title);
        $('.video-container').html(
            `<video type="video/mp4" 
                    controls=""
                    class="video-stream"><source src="` + loadStep.data.src + `">
                    </video>` 
        );
        $('.video-title').text(loadStep.data.title);
        $('.video-copy').text(loadStep.data.copy);
        $('.current-step-num').text(loadStep.stepNum);
        $('.total-steps').text(course.steps.length);

        for (const stepNum in course.steps){
            let step = course.steps[stepNum];
            let isCurrentStep = "";
            if (step.stepNum == loadStep.stepNum){
                isCurrentStep = "current-step";
            };
            let stepHTML = `<div class="step `+ isCurrentStep + `" data-stepNum="` + step.stepNum + `">
            <img class="play-btn" src="../img/knowledge.png"/>
            <p class="step-title">` + step.title + `</p>
            </div>`
            $('.steps-container').append(stepHTML);

        }
    }

});