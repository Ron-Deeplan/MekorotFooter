import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'MekorotFooterWebPartWebPartStrings';
import MekorotFooterWebPart, { FooterCMPProps } from './components/MekorotFooterWebPart';
import { SPContextService } from '../../SPContext.srv';
                    
const { solution } = require('../../../config/package-solution.json');

export interface IMekorotFooterWebPartWebPartProps {
  description: string;
  title: string;
  contactListId: string;
}

export default class MekorotFooterWebPartWebPart extends BaseClientSideWebPart<IMekorotFooterWebPartWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<FooterCMPProps> = React.createElement(
      MekorotFooterWebPart,
      {
        title: this.properties.title,
        contactListId: this.properties.contactListId,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    this.observeAndRemoveElements();
    console.log(solution.name, solution.version);
    this._loadGoogleFonts();
    SPContextService.initialize(this.context, this.properties);
    if(SPContextService.isRunningOnLocalhost()){
      import('../../globalStyles/workbench.scss');
      import('../../globalStyles/hideSpPageStyles.scss');
    }
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }


  private _loadGoogleFonts(): void {
    // Check if fonts are already loaded
    if (document.querySelector('link[href*="fonts.googleapis.com"]')) {
        return;
    }

    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  } 

  private observeAndRemoveElements(timeoutSeconds = 15) {
    // const selector1 = 'div[data-automationid="SimpleFooter"]';
    let shouldRemove = false;
    const selector2 = "#CommentsWrapper";
    const observer = new MutationObserver(() => {
      // Remove first element
      // const el1 = document.querySelector(selector1);
      // if (el1) {
      //   el1.remove();
      //   console.log(`Should Remove first : ${selector1} element`);
      // }
      
      // Remove second element
      const el2 = document.querySelector<HTMLElement>(selector2);
      if (el2) {
        shouldRemove = true;
        // el2.style.setProperty('display', 'none', 'important');
        el2.remove();
        console.log(`Should Remove second : ${selector2} element`);
      }
      if(shouldRemove){
        observer.disconnect();
        console.log('Observer stopped after ' + timeoutSeconds + ' seconds');
      }
    });
  
    // Start observing the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  
    // Stop after timeout
    setTimeout(() => {
      observer.disconnect();
      console.log('Observer stopped after ' + timeoutSeconds + ' seconds');
    }, timeoutSeconds * 1000);
  
    console.log('Observer started for ' + timeoutSeconds + ' seconds');
  }




  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse(solution.version);
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    // Handle property changes
    if (propertyPath === 'contactListId') {
      // Refresh the web part when list selections change
      this.render();
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('title',{
                  label: strings.TitleFieldLabel
                }),
                PropertyFieldListPicker('contactListId',{
                  label: strings.contactListIdFieldLabel,
                  selectedList : this.properties.contactListId,
                  includeHidden : false,
                  orderBy : PropertyFieldListPickerOrderBy.Title,
                  onPropertyChange : this.onPropertyPaneFieldChanged.bind(this),
                  disabled : false,
                  properties : this.properties,
                  context : this.context as any,
                  key : "ContactListPicker"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
