import { SPFI } from '@pnp/sp';
import { SPContextService } from '../../../SPContext.srv';

// const contactListId = "395429d0-5046-4dc2-b992-32b5db71cc3a"

export class FooterService {
    private sp = SPContextService.getSP();

    public async getFooterContacts(contactListId:string){
        try {
          const contactList = await this.sp.web.lists.getById(contactListId).items.filter(`shouldShow eq 1`)();
          return contactList
        } 
        catch (error) {
          console.error("Error getting footer contacts : " , error)
          return []
        }
    }

    public async getContactsByCategory(category:string , contactListId:string){
        try {
            const contactByCategory = await this.sp.web.lists.getById(contactListId).items.filter(`Category eq ${category} and shouldShow eq 1`)();
            return contactByCategory
        } catch (error) {
            console.error("Error getting contacts by category : " , error)
            return []
        }
    }

    public async getContactCategoryOptions (contactListId:string){
        try {
            const contactCategories = await this.sp.web.lists.getById(contactListId).fields.getByInternalNameOrTitle("Category")();
            return contactCategories.Choices
        } catch (error) {
            console.error("Error getting contacts by category : " , error)
            return []
        }
    }

}