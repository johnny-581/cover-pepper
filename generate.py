import os
import subprocess
import json
import google.generativeai as genai
from PIL import Image
import argparse

# --- Configuration and Setup ---

def configure_api():
    """Configures the Gemini API with the key from environment variables."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set. Please set it to your API key.")
    genai.configure(api_key=api_key)

# --- Core Functions ---

def extract_job_details_from_image(image_path: str) -> dict:
    """
    Uses the Gemini Pro Vision model to extract job details from an image.

    Args:
        image_path: The file path to the job posting image.

    Returns:
        A dictionary containing the extracted job details.
    """
    print(f"Opening image at: {image_path}")
    try:
        img = Image.open(image_path)
    except FileNotFoundError:
        raise FileNotFoundError(f"Error: The image file was not found at {image_path}")

    model = genai.GenerativeModel('gemini-pro-vision')

    # A detailed prompt asking for JSON output for consistency
    prompt = """
    From the provided image of a job posting, analyze the content and extract the following details precisely.
    Return the output as a clean JSON object only.

    1. "company_name": The name of the company.
    2. "company_address": The physical address of the company (e.g., "City, State, Country"). If not present, set to an empty string.
    3. "role_title": The full title of the job role, including any ID numbers if available.
    4. "hiring_manager_name": The name of the hiring manager if specified. If not, default to "Hiring Manager".

    Example JSON output:
    {
        "company_name": "Example Corp",
        "company_address": "San Francisco, CA, USA",
        "role_title": "Software Engineer 12345",
        "hiring_manager_name": "Jane Doe"
    }
    """

    print("Sending request to Gemini API... This may take a moment.")
    response = model.generate_content([prompt, img])

    # Clean up the response to ensure it's valid JSON
    cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
    
    try:
        print("Parsing API response.")
        return json.loads(cleaned_response_text)
    except json.JSONDecodeError:
        raise ValueError(f"Error: Failed to decode JSON from Gemini API response. Response was:\n{response.text}")

def update_latex_file(template_path: str, output_path: str, data: dict):
    """
    Replaces placeholder text in a LaTeX template with extracted data.

    Args:
        template_path: Path to the original .tex template file.
        output_path: Path to save the updated .tex file.
        data: Dictionary with the information to insert.
    """
    print(f"Reading LaTeX template from: {template_path}")
    try:
        with open(template_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Error: The LaTeX template was not found at {template_path}")

    # Replace placeholders with data from Gemini
    content = content.replace("Ledcor Corporation", data.get("company_name", "Ledcor Corporation"))
    content = content.replace("Vancouver, BC, Canada", data.get("company_address", "Vancouver, BC, Canada"))
    content = content.replace("Quality Analyst 169781", data.get("role_title", "Quality Analyst 169781"))
    content = content.replace("Dear Hiring Manager,", f"Dear {data.get('hiring_manager_name', 'Hiring Manager')},")

    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Successfully created updated LaTeX file at: {output_path}")

def compile_latex_to_pdf(latex_file_path: str):
    """
    Compiles a .tex file into a PDF using pdflatex.

    Args:
        latex_file_path: The path to the .tex file to compile.
    """
    # Get the directory of the LaTeX file to avoid issues with file paths
    directory = os.path.dirname(latex_file_path) or '.'
    filename = os.path.basename(latex_file_path)
    
    print(f"Attempting to compile {filename} to PDF...")
    # Using -output-directory ensures all auxiliary files also go there
    # We run it twice to ensure all references (like page numbers) are correctly generated
    for i in range(2):
        process = subprocess.run(
            ['pdflatex', '-interaction=nonstopmode', f'-output-directory={directory}', filename],
            capture_output=True, text=True
        )
        if process.returncode != 0:
            print("--- LaTeX Compilation Failed ---")
            print(process.stdout)
            print(process.stderr)
            raise RuntimeError("pdflatex compilation failed. Ensure LaTeX is installed and in your system's PATH.")
    
    pdf_path = latex_file_path.replace(".tex", ".pdf")
    print(f"✅ Successfully compiled PDF: {pdf_path}")


# --- Main Execution ---

def main():
    """Main function to orchestrate the entire process."""
    parser = argparse.ArgumentParser(description="Automate cover letter generation from a job posting image.")
    parser.add_argument("image_file", help="Path to the job posting image file (e.g., job_posting.png)")
    parser.add_argument("template_file", help="Path to the LaTeX template file (e.g., cover_letter_template.tex)")
    args = parser.parse_args()

    try:
        configure_api()
        extracted_data = extract_job_details_from_image(args.image_file)
        print("\nExtracted Information:")
        print(json.dumps(extracted_data, indent=2))

        # Define the name for the new .tex file
        base_name = os.path.splitext(os.path.basename(args.template_file))[0]
        company_name_sanitized = "".join(c for c in extracted_data['company_name'] if c.isalnum())
        updated_tex_path = f"{base_name}_{company_name_sanitized}.tex"

        update_latex_file(args.template_file, updated_tex_path, extracted_data)
        compile_latex_to_pdf(updated_tex_path)

    except (ValueError, FileNotFoundError, RuntimeError) as e:
        print(f"\n❌ An error occurred: {e}")

if __name__ == "__main__":
    main()