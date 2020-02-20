$(()=>{

    const loadManifest= () =>{
        return new Promise((resolve, reject) =>{
            $.get('../content/manifest.json', (manifest) =>{
                if (manifest){

                    populateCourses(manifest);

                } else {
                    displayErrorPage("Uh oh, something went wrong...");
                }
                console.log("fetch successful", manifest);
            });
        });
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

    const populateCourses = (manifest) =>{
        $('.course-grid').html("");

        let params = readParamsFromUrl();
        let newCompletion = '';
        if (params){
            if (params.complete){
                newCompletion = params.complete;
            }
        }

        for (var idx in manifest.courses){

            let course = manifest.courses[idx];
            let progressHTML = '<div class="prog-spacer"></div>';

            let courseProgress = loadCourseProgress(course.id);

            let buttonText = "Start Course";

            if (courseProgress){
                if (courseProgress > 0 && courseProgress < 100){
                    progressHTML = `                    
                    <div class="progress-container">
                        <div class="meter">
                            <p class="percent-text">` + courseProgress + `%</p>
                            <span class="percent-completion" style="width:` + courseProgress + `%;"></span>
                        </div>
                    </div>`;
                    buttonText = "Resume Course";
                } else if (courseProgress >= 100){
                    
                    let newCompletionClass='';
                    if (course.id == newCompletion){
                        newCompletionClass='new-completion';
                    }
                    progressHTML = `<div class="complete-stamp ` + newCompletionClass +`"><span class="stamp is-approved">Complete</span></div>`
                    buttonText = "Revist Course";
                }
            }

            let courseHTML =   `
            <div class="course" id="` + course.id + `">
            ` + progressHTML + `
            <img class="course-icon" src="./` + course.icon + `"/>
            <p class="course-title">` + course.title + `</p>
            <p class="course-description">` + course.summary + `</p>
            <p class="course-time">` + course.estTime +`</p>
            <a class="btn-start-course" href="/learn?id=` + course.id + `">` + buttonText + `</a>
        </div>`

        $('.course-grid').append(courseHTML);

        }

        if (newCompletion){
            if ($('#' + newCompletion).length){
                $('#' + newCompletion)[0].scrollIntoView();
                $('.new-completion').addClass('fade-in');
                $('.new-completion').removeClass('new-completion');

            }
        }
    }

    const loadCourseProgress = (courseId) =>{

        let storage = window.localStorage;
        let allCourseProg = storage.getItem("all-course-prog");
        if (allCourseProg){
            allCourseProg = JSON.parse(allCourseProg);
            if (allCourseProg[courseId]){
                return allCourseProg[courseId]
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    loadManifest();
})