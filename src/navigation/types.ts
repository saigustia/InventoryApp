export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddProduct: undefined;
  ProductDetail: { productId: string };
  SalesHistory: undefined;
  Receipt: { saleId: string };
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  Sales: undefined;
};

export type InventoryStackParamList = {
  InventoryList: undefined;
  AddProduct: undefined;
  ProductDetail: { productId: string };
  EditProduct: { productId: string };
};

export type SalesStackParamList = {
  SalesEntry: undefined;
  SalesHistory: undefined;
  Receipt: { saleId: string };
};

// Navigation prop types
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: any; // Replace with proper navigation type
  route: {
    params: RootStackParamList[T];
  };
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = {
  navigation: any; // Replace with proper navigation type
  route: {
    params: AuthStackParamList[T];
  };
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: any; // Replace with proper navigation type
  route: {
    params: MainTabParamList[T];
  };
};
