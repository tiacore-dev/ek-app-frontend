import "@ant-design/v5-patch-for-react-19";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { axiosInstance } from "../../axiosConfig";
import { SoundUtils } from "../../components/soundUtils";
import { store } from "../../redux/store";
import { ScanParcelItemsPage } from "./scanParcelsPage";

const mockNavigate = jest.fn();
jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ manifest_id: "manifest-test" }),
  }),
  { virtual: true }
);
jest.mock("../../axiosConfig", () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn() },
}));

function renderScanPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <ScanParcelItemsPage />
      </QueryClientProvider>
    </Provider>
  );
}

function scanWithKeyboard(value: string) {
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: "Enter" });
}

it("restores a legacy draft, scans both formats, and sends the original barcode to 1C", async () => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  });
  HTMLElement.prototype.scrollIntoView = jest.fn();
  jest.spyOn(SoundUtils.prototype, "playBeepSound").mockImplementation(() => {});

  const apiUrl = process.env.REACT_APP_API_URL;
  process.env.REACT_APP_API_URL = "https://example.test/hs/api/";
  localStorage.setItem("token", "test-token");
  const parcelId = "12345678-1234-1234-1234-123456789abc";
  const parcelNumber = "001-INS*";
  const date = "2026-11-25T10:00:00.000Z";
  sessionStorage.setItem(
    "manifest_temp_manifest-test",
    JSON.stringify({ [parcelNumber]: [{ place: 1, date }] })
  );
  jest.mocked(axiosInstance.get).mockResolvedValue({
    data: {
      parcels: [
        {
          id: parcelId,
          number: parcelNumber,
          count: 3,
          barcodes: ["PLACE-1", "PLACE-2", "000005123456"],
        },
      ],
    },
  });
  jest.mocked(axiosInstance.post).mockResolvedValue({ data: {} });

  try {
    const page = renderScanPage();
    expect(
      await screen.findByText("Прогресс сканирования: 1 из 3 мест")
    ).toBeVisible();

    scanWithKeyboard(`${parcelNumber}%02`);
    expect(screen.getByText("Прогресс сканирования: 2 из 3 мест")).toBeVisible();

    scanWithKeyboard("PLACE-2");
    const error = await screen.findByRole("dialog");
    expect(within(error).getByText(/уже было отсканировано/)).toBeInTheDocument();
    fireEvent.click(within(error).getByRole("button", { name: "OK" }));

    scanWithKeyboard("000005123456");
    expect(screen.getByText("Прогресс сканирования: 3 из 3 мест")).toBeVisible();
    await waitFor(() => {
      expect(localStorage.getItem("manifest_scans_v3")).toContain(
        '"barcode":"000005123456"'
      );
    });
    page.unmount();
    sessionStorage.removeItem("manifest_temp_manifest-test");
    renderScanPage();

    expect(
      await screen.findByText("Прогресс сканирования: 3 из 3 мест")
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Подтвердить загрузку манифеста" })
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(-1));
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "https://example.test/hs/api/manifest-loading/manifest-test/post",
      {
        comment: "Все места накладных отсканированы",
        scannedItems: [
          { parcelId, parcelNumber, place: 1, scanTime: date },
          {
            parcelId,
            parcelNumber,
            place: 2,
            scanTime: expect.any(String),
            barcode: `${parcelNumber}%02`,
          },
          {
            parcelId,
            parcelNumber,
            place: 3,
            scanTime: expect.any(String),
            barcode: "000005123456",
          },
        ],
      },
      { headers: { token: "test-token" } }
    );
  } finally {
    if (apiUrl === undefined) delete process.env.REACT_APP_API_URL;
    else process.env.REACT_APP_API_URL = apiUrl;
    sessionStorage.clear();
    localStorage.clear();
    jest.restoreAllMocks();
  }
});
