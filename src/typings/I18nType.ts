export interface I18nType {
    message: string,
    description: string
}

export type I18nResponse = Record<string, I18nType>
