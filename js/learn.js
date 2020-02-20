$(()=>{
    let courseManifest;
    let courseId;
    let currentStep = 1;
    let completedSteps = [];


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
        $('.error-message').text(err);
        $('.error-content').show();
        $('.main-content').hide();
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
        loadProgress(course.id);
        let loadStep = course.steps[currentStep-1];
        $('.course-title').text(course.title);
        $('.course-description').text(course.copy);
        $('.course-icon').attr("src", "../" + course.icon);
        loadModule(loadStep, course);
    }

    const loadProgress = (id) =>{
        let storage = window.localStorage;
        let progressData = storage.getItem("course-prog-" + id);
        if (progressData){
            progressData = JSON.parse(progressData);
            currentStep = progressData.currentStep;
            completedSteps = progressData.completedSteps;
            console.log("Progress loaded...")
        } else {
            console.log("No progress to load for this course");
        }
    }

    const loadModule = (step, course) =>{
        $('.video-container').html(
            `<video type="video/mp4" 
                    controls=""
                    class="video-stream"><source src="` + step.data.src + `">
                    </video>` 
        );
        $('.video-title').text(step.data.title);
        $('.video-copy').text(step.data.copy);
        $('.current-step-num').text(step.stepNum);
        $('.total-steps').text(course.steps.length);

        let percentComplete = Math.floor((completedSteps.length/course.steps.length)*100);
        $('.percent-text').text(percentComplete + "%");
        $('.percent-completion').css('width', percentComplete + '%');

        $('.steps-container').html('');

        for (const stepNum in course.steps){
            let thisStep = course.steps[stepNum];
            let isCurrentStep = "";
            if (thisStep.stepNum == step.stepNum){
                isCurrentStep = "current-step";
            };
            let doneStyle = "";
            let doneImg = 'src="../img/60734.svg"';
            if (completedSteps.indexOf(thisStep.stepNum) > -1){
                if (!isCurrentStep){
                    doneStyle = 'completed-step';
                }
                doneImg = 'src="../img/completed.png"';
            }
            let stepHTML = `<div class="step `+ isCurrentStep + ` ` + doneStyle + `" data-stepNum="` + thisStep.stepNum + `">
            <img class="play-btn"` + doneImg + `/>
            <p class="step-title">` + thisStep.title + `</p>
            </div>`
            $('.steps-container').append(stepHTML);

        }

        if (currentStep >= course.steps.length){
            $('.next-module-btn').text("Complete Course");
        } else {
            $('.next-module-btn').text("Next >>>");
        }
    }


    $('.next-module-btn').on('click',(e) =>{

        if (completedSteps.indexOf(currentStep) < 0){
            completedSteps.push(currentStep);
        }

        if(currentStep < courseManifest.steps.length){
            currentStep++;
        }else {
            window.location = "../?complete=" + courseManifest.id;
        }
        saveProgress();
        loadModule(courseManifest.steps[currentStep-1], courseManifest);
    });

    $(document).on('click','.step',(e) =>{
        let tar = $(e.currentTarget).data('stepnum');
        
        if (completedSteps.indexOf(currentStep) < 0){
            completedSteps.push(currentStep);
        }

        saveProgress();
        currentStep = tar;
        loadModule(courseManifest.steps[tar-1], courseManifest);
    })

    const saveProgress = () =>{

        let storage = window.localStorage;
        storage.setItem("course-prog-" + courseManifest.id, JSON.stringify({
            currentStep: currentStep,
            completedSteps: completedSteps
        }));

        let percent = Math.floor((completedSteps.length/courseManifest.steps.length) * 100);
        let allCourseProgress = storage.getItem("all-course-prog");
        if (allCourseProgress){
            allCourseProgress = JSON.parse(allCourseProgress);
            allCourseProgress[courseManifest.id] = percent;
        } else {
            allCourseProgress = {
            };
            allCourseProgress[courseManifest.id] = percent;
        }
        storage.setItem("all-course-prog" , JSON.stringify(allCourseProgress));
    }

});