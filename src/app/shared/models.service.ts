import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { Model } from './models.model';

@Injectable({providedIn: 'root'})

export class ModelsService {
    modelsChanged = new Subject<Model[]>();
    models: Model[] = [
        // new Model('PDC Bit', 'DD306S', 'Huhges', 2.5, 8.5, 'https://66.media.tumblr.com/71458851cc5d4d73222ad66a15b14773/tumblr_o1vdn29vml1uxl379o1_640.jpg')
    ];

    setModels(models: Model[]) {   
        if (models) {             
            this.models = models;
            localStorage.setItem('models', JSON.stringify(this.models.slice()));
        }
    }

    getModels() {
        return this.models.slice();
    }

    getModel(index: number) {
        return this.models[index];
    }

    updateModel(index: number, model: Model) {
        this.models.splice(index, 1, model);
        this.modelsChanged.next(this.models.slice());
        localStorage.setItem('models', JSON.stringify(this.models.slice()));
    }

    addModel(model: Model) {
        this.models.push(model);
        this.modelsChanged.next(this.models.slice());
        localStorage.setItem('models', JSON.stringify(this.models.slice()));
    }

    removeModel(index: number) {
        this.models.splice(index, 1);
        this.modelsChanged.next(this.models.slice());
        localStorage.setItem('models', JSON.stringify(this.models.slice()));
    }

}