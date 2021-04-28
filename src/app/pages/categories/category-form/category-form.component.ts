import { Component, OnInit, AfterContentChecked } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Category } from "./../shared/category.model";
import { CategoryService } from "./../../categories/shared/category.service";

import { switchMap } from "rxjs/operators";
import toastr from "toastr";

@Component({
  selector: "app-category-form",
  templateUrl: "./category-form.component.html",
  styleUrls: ["./category-form.component.css"],
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {
  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessanges: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === "new") {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  /** PRIVATE METHODS */
  private setCurrentAction() {
    if (this.route.snapshot.url[0].path === "new") {
      this.currentAction = "new";
    } else {
      this.currentAction = "edit";
    }
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
    });
  }

  private loadCategory() {
    if (this.currentAction === "edit") {
      this.route.paramMap
        .pipe(
          switchMap((params) => this.categoryService.getById(+params.get("id")))
        )
        .subscribe(
          (category) => {
            this.category = category;
            this.categoryForm.patchValue(category);
          },
          (error) => alert("ocorreu um erro no servidor, tente mais tarde")
        );
    }
  }

  private setPageTitle() {
    if (this.currentAction === "new") {
      this.pageTitle = "cadastroo de nova caterogia";
    } else {
      const categoryName = this.category.name || "";
      this.pageTitle = "Editando categoria: " + categoryName;
    }
  }

  private createCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );
    console.log(category);
    this.categoryService.create(category).subscribe(
      (categoryin) => this.actionForSuccess(categoryin),
      (error) => this.actionsForError(error)
    );
  }

  private updateCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );
    console.log(category);
    this.categoryService.update(category).subscribe(
      (categoryin) => this.actionForSuccess(categoryin),
      (error) => this.actionsForError(error)
    );
  }

  private actionForSuccess(category: Category) {
    toastr.success("solicitacao processada com sucesso!");
    this.router
      .navigateByUrl("categories", { skipLocationChange: true })
      .then(() => this.router.navigate(["categories", category.id, "edit"]));
  }
  private actionsForError(error: any) {
    toastr.error("ocorreu um erro ao processar a sua solicitacao");
    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessanges = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessanges = [
        "Falha na comunicaçao com o servidor. Por favor, teste mais tarde.",
      ];
    }
  }
}
